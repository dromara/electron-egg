import argparse
import asyncio
import logging
import threading
import queue
import traceback
import time
import json
import sys
import os
import socket
from typing import Dict, List
from concurrent.futures import ThreadPoolExecutor

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel
from asyncio import Queue

# 导入两个程序的核心类/模块
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "DouyinLiveWebFetcher"))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "DouyinLiveRecorder"))
from DouyinLiveWebFetcher.liveMan import DouyinLiveWebFetcher
import DouyinLiveRecorder.main as recorder_main

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 检查端口是否可用
def is_port_available(port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        sock.bind(('127.0.0.1', port))
        return True
    except:
        return False
    finally:
        sock.close()

# 寻找可用端口
def find_available_port(start_port):
    port = start_port
    while not is_port_available(port):
        port += 1
        if port > start_port + 100:  # 最多尝试100个端口
            raise Exception("无法找到可用端口")
    return port

app = FastAPI(title="抖音直播API服务", description="抖音直播弹幕抓取和直播录制相关API服务")

# 添加CORS中间件，允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

# ===== Web Fetcher 相关变量 =====
# 存储活跃的直播抓取器实例
active_rooms: Dict[str, DouyinLiveWebFetcher] = {}
# 存储每个直播间的消息队列
message_queues: Dict[str, queue.Queue] = {}

# ===== Recorder 相关变量 =====
# 存储最新的状态数据
latest_status: Dict = {}
# 为每个SSE客户端创建一个队列
recorder_message_queues: List[Queue] = []
# 标记recorder是否已经运行
recorder_running = False
# 创建一个锁，用于防止多个请求同时启动recorder
recorder_lock = threading.Lock()

# ===== 中间件 =====
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """记录所有请求的中间件"""
    logger.info(f"收到请求: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"响应状态码: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"处理请求时出错: {str(e)}")
        logger.error(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

# ===== 通用接口 =====
@app.get("/")
async def index():
    return {"message": "抖音直播API服务", "version": "1.0.0"}

# ===== Web Fetcher 相关接口 =====
class MonitorResponse(BaseModel):
    status: str
    message: str

@app.post("/api/v1/rooms/{live_id}/monitor", response_model=MonitorResponse)
async def start_monitor(live_id: str):
    """开始监控指定直播间"""
    logger.info(f"开始监控直播间: {live_id}")
    
    if live_id in active_rooms:
        logger.info(f"直播间 {live_id} 监控已经在运行")
        return {"status": "already_running", "message": f"直播间 {live_id} 监控已经在运行"}
    
    try:
        # 为该直播间创建消息队列
        logger.info(f"为直播间 {live_id} 创建消息队列")
        msg_queue = queue.Queue()
        message_queues[live_id] = msg_queue
        
        # 创建直播抓取器实例，传入消息队列
        logger.info(f"创建直播抓取器实例")
        room = DouyinLiveWebFetcher(live_id, msg_queue)
        active_rooms[live_id] = room
        
        # 获取直播间状态
        logger.info(f"获取直播间状态")
        room.get_room_status()
        
        # 在新线程中启动监控
        logger.info(f"准备启动线程")
        def start_fetcher():
            try:
                logger.info(f"监控线程已启动")
                room.start()
            except Exception as e:
                logger.error(f"监控线程发生错误: {str(e)}")
                logger.error(traceback.format_exc())
        
        threading.Thread(target=start_fetcher, daemon=True).start()
        
        logger.info(f"成功开始监控直播间 {live_id}")
        return {"status": "success", "message": f"已开始监控直播间 {live_id}"}
    except Exception as e:
        logger.error(f"开始监控直播间 {live_id} 时出错: {str(e)}")
        logger.error(traceback.format_exc())
        return {"status": "error", "message": f"启动失败: {str(e)}"}

@app.delete("/api/v1/rooms/{live_id}/monitor")
async def stop_monitor(live_id: str):
    """停止监控指定直播间"""
    if live_id not in active_rooms:
        return {"status": "not_running", "message": f"直播间 {live_id} 监控未在运行"}
    
    room = active_rooms[live_id]
    room.stop()
    
    # 清理资源
    del active_rooms[live_id]
    if live_id in message_queues:
        del message_queues[live_id]
    
    return {"status": "success", "message": f"已停止监控直播间 {live_id}"}

@app.get("/api/v1/rooms/{live_id}")
async def get_room_status(live_id: str):
    """获取直播间状态"""
    try:
        # 如果直播间已经在监控中，使用现有实例
        if live_id in active_rooms:
            room = active_rooms[live_id]
        else:
            # 否则创建临时实例
            room = DouyinLiveWebFetcher(live_id)
        
        # 获取直播间状态
        room.get_room_status()
        
        return {
            "status": "success", 
            "live_id": live_id,
            "is_monitoring": live_id in active_rooms
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.get("/api/v1/rooms/{live_id}/events")
async def events(request: Request, live_id: str):
    """SSE事件流，用于向前端推送直播间消息"""
    if live_id not in message_queues:
        return {"error": "直播间未监控"}
    
    async def event_generator():
        # 当客户端连接时，发送一个连接成功的消息
        yield {
            "event": "connected", 
            "data": f"已连接到直播间 {live_id} 的消息流"
        }
        
        # 持续监控消息队列并发送消息
        msg_queue = message_queues[live_id]
        while True:
            # 检查客户端是否断开连接
            if await request.is_disconnected():
                break
            
            # 如果队列中有消息，则取出并发送
            try:
                if not msg_queue.empty():
                    message = msg_queue.get_nowait()
                    yield {
                        "event": message["type"], 
                        "data": message["message"]
                    }
                else:
                    # 没有消息时短暂休眠
                    await asyncio.sleep(0.1)
            except Exception as e:
                yield {"event": "error", "data": str(e)}
                break
    
    return EventSourceResponse(event_generator())

# 获取所有被监控的直播间列表
@app.get("/api/v1/rooms")
async def list_rooms():
    """获取所有被监控的直播间列表"""
    if not active_rooms:
        return {"status": "success", "message": "没有正在监控的直播间", "rooms": []}
    
    rooms = []
    for live_id in active_rooms:
        rooms.append({
            "live_id": live_id,
            "is_monitoring": True
        })
    return {"status": "success", "rooms": rooms}

# ===== Recorder 相关接口 =====
# SSE事件流生成器
async def sse_generator(queue):
    try:
        # 如果有最新状态，立即发送
        if latest_status:
            yield f"data: {json.dumps(latest_status)}\n\n"
        
        while True:
            # 等待新消息
            message = await queue.get()
            if message is None:  # 结束信号
                break
            # 格式化为SSE事件
            yield f"data: {json.dumps(message)}\n\n"
    except asyncio.CancelledError:
        # 客户端断开连接
        pass

# SSE端点
@app.get("/api/sse/recorder/status")
async def sse_endpoint():
    queue = Queue()
    recorder_message_queues.append(queue)
    
    # 使用StreamingResponse返回SSE流
    return StreamingResponse(
        sse_generator(queue),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

# 启动录制器的API端点
@app.post("/api/recorder/start")
async def start_recorder():
    global recorder_running
    
    # 使用锁确保只有一个请求能启动recorder
    with recorder_lock:
        if recorder_running:
            return JSONResponse(
                status_code=200,
                content={
                    "success": True,
                    "message": "录制器已经在运行中",
                    "status": "running"
                }
            )
        
        # 在新线程中启动recorder_main.run()
        def run_recorder():
            global recorder_running
            recorder_running = True
            try:
                recorder_main.run()
            except Exception as e:
                recorder_running = False
                logger.error(f"录制器运行出错: {str(e)}")
        
        threading.Thread(target=run_recorder, daemon=True).start()
        
        return JSONResponse(
            status_code=200, 
            content={
                "success": True,
                "message": "录制器已启动",
                "status": "started"
            }
        )

# 获取录制器状态的API端点
@app.get("/api/recorder/status")
async def get_recorder_status():
    global recorder_running
    
    return JSONResponse(
        status_code=200,
        content={
            "running": recorder_running,
            "status": "running" if recorder_running else "stopped",
            "latest_status": latest_status
        }
    )

# 更新状态的函数，将由recorder_main调用
async def update_status(status_data: dict):
    global latest_status
    latest_status = status_data
    
    # 向所有连接的SSE客户端广播数据
    for queue in recorder_message_queues[:]:
        try:
            await queue.put(status_data)
        except Exception:
            # 如果发送失败，从队列列表中移除
            if queue in recorder_message_queues:
                recorder_message_queues.remove(queue)

# 注入update_status函数到recorder_main模块
recorder_main.live_recorder_api = type('', (), {})()
recorder_main.live_recorder_api.update_status = update_status

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='抖音直播API服务')
    parser.add_argument('--port', type=int, default=7075, help='服务端口号')
    args = parser.parse_args()
    
    # 尝试使用指定端口，如果被占用则自动寻找可用端口
    try:
        port = args.port
        if not is_port_available(port):
            port = find_available_port(port)
            print(f"端口 {args.port} 已被占用，自动切换到可用端口: {port}")
        
        print(f"抖音直播API服务启动在端口: {port}")
        print(f"可以通过以下端点访问API:")
        print(f"- 弹幕抓取相关:")
        print(f"  - GET    http://127.0.0.1:{port}/api/v1/rooms/<live_id> - 获取直播间状态")
        print(f"  - POST   http://127.0.0.1:{port}/api/v1/rooms/<live_id>/monitor - 开始监控")
        print(f"  - DELETE http://127.0.0.1:{port}/api/v1/rooms/<live_id>/monitor - 停止监控")
        print(f"  - GET    http://127.0.0.1:{port}/api/v1/rooms/<live_id>/events - SSE事件流")
        print(f"- 录制相关:")
        print(f"  - POST   http://127.0.0.1:{port}/api/recorder/start - 启动录制器")
        print(f"  - GET    http://127.0.0.1:{port}/api/recorder/status - 获取录制器状态")
        print(f"  - GET    http://127.0.0.1:{port}/api/sse/recorder/status - 录制器状态SSE事件流")
        
        uvicorn.run(app, host="127.0.0.1", port=port)
    except Exception as e:
        logger.error(f"启动服务出错: {str(e)}")
        logger.error(traceback.format_exc())

