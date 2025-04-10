import argparse
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import Dict, List
import os
import threading
import sys
import asyncio
import json
from asyncio import Queue

# 确保main模块可以被导入
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
# 导入main模块
import main

app = FastAPI(title="直播录制API服务", description="抖音直播录制相关API服务")

# 配置文件路径
url_config_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "URL.ini")
text_encoding = "utf-8"
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--port', type=int, default=7074, help='The port number.')
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
    
    # 运行main模块的run方法
    main.run()

    # 控制台默认关闭输出信息，如果想要查看控制台输出，请单独启动服务 npm run dev-python
    print("python server is running at port:", args.port)