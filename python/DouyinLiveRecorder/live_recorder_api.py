import argparse
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Dict, List
import os
import threading
import sys
import asyncio
import json
from asyncio import Queue
import time

# 确保main模块可以被导入
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# 导入main模块
import main

app = FastAPI(title="直播录制API服务", description="抖音直播录制相关API服务")

# 配置文件路径
url_config_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "URL.ini")
text_encoding = "utf-8"
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--port', type=int, default=7075, help='The port number.')
args = parser.parse_args()
# 添加CORS中间件，允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

# 存储最新的状态数据
latest_status: Dict = {}
# 为每个SSE客户端创建一个队列
message_queues: List[Queue] = []
# 标记recorder是否已经运行
recorder_running = False
# 创建一个锁，用于防止多个请求同时启动recorder
recorder_lock = threading.Lock()


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
    message_queues.append(queue)
    
    # 使用StreamingResponse返回SSE流
    return StreamingResponse(
        sse_generator(queue),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@app.get("/")
async def root():
    return {"message": "DouyinLiveRecorder API服务", "version": "1.0.0"}


# 新增：启动录制器的API端点
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
        
        # 在新线程中启动main.run()
        def run_main():
            global recorder_running
            recorder_running = True
            try:
                main.run()
            except Exception as e:
                recorder_running = False
                print(f"录制器运行出错: {str(e)}")
        
        threading.Thread(target=run_main, daemon=True).start()
        
        return JSONResponse(
            status_code=200, 
            content={
                "success": True,
                "message": "录制器已启动",
                "status": "started"
            }
        )


# 新增：获取录制器状态的API端点
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


# 更新状态的函数，将由main.py调用
async def update_status(status_data: dict):
    global latest_status
    latest_status = status_data
    
    # 向所有连接的SSE客户端广播数据
    for queue in message_queues[:]:
        try:
            await queue.put(status_data)
        except Exception:
            # 如果发送失败，从队列列表中移除
            if queue in message_queues:
                message_queues.remove(queue)


def run_uvicorn():
    """在单独的线程中运行uvicorn服务器"""
    uvicorn.run(app, host="127.0.0.1", port=args.port)


if __name__ == "__main__":
    # 创建并启动uvicorn服务线程
    uvicorn_thread = threading.Thread(target=run_uvicorn, daemon=True)
    uvicorn_thread.start()
    
    # 注意：不再自动运行main.run()，而是等待API请求
    
    # 控制台默认关闭输出信息，如果想要查看控制台输出，请单独启动服务 npm run dev-python
    print("python server is running at port:", args.port)
    print("请通过API请求启动录制器: POST /api/recorder/start")
    
    # 保持主线程运行
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("服务已停止")
        sys.exit(0)