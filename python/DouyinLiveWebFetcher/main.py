import argparse
import asyncio
import logging
import threading
import queue
import traceback
from typing import Dict
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel

from liveMan import DouyinLiveWebFetcher

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# 添加CORS中间件，允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

# 存储活跃的直播抓取器实例
active_rooms: Dict[str, DouyinLiveWebFetcher] = {}
# 存储每个直播间的消息队列
message_queues: Dict[str, queue.Queue] = {}


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


@app.get("/")
async def index():
    return {"message": "抖音直播弹幕抓取器API"}


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


# 处理命令行参数
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='抖音直播弹幕抓取API服务')
    parser.add_argument('--port', type=int, default=7074, help='服务端口号')
    args = parser.parse_args()
    
    print(f"抖音直播弹幕抓取API服务启动在端口: {args.port}")
    print(f"可以通过以下端点访问API:")
    print(f"- GET    http://127.0.0.1:{args.port}/api/v1/rooms/<live_id> - 获取直播间状态")
    print(f"- POST   http://127.0.0.1:{args.port}/api/v1/rooms/<live_id>/monitor - 开始监控")
    print(f"- DELETE http://127.0.0.1:{args.port}/api/v1/rooms/<live_id>/monitor - 停止监控")
    print(f"- GET    http://127.0.0.1:{args.port}/api/v1/rooms/<live_id>/events - SSE事件流")
    
    uvicorn.run(app, host="127.0.0.1", port=args.port)