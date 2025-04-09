import asyncio
import uvicorn
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Set

app = FastAPI()

# 添加CORS中间件，允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

# 存储活跃的WebSocket连接
active_connections: List[WebSocket] = []
# 存储最新的状态数据
latest_status: Dict = {}


class StatusBroadcaster:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # 连接后立即发送最新状态
        if latest_status:
            await websocket.send_json(latest_status)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, data: dict):
        # 更新最新状态
        global latest_status
        latest_status = data
        # 向所有连接的客户端广播数据
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                # 如果发送失败，从活跃连接中移除
                self.active_connections.remove(connection)


# 创建广播实例
status_broadcaster = StatusBroadcaster()


@app.websocket("/ws/status")
async def websocket_endpoint(websocket: WebSocket):
    await status_broadcaster.connect(websocket)
    try:
        while True:
            # 保持连接，等待客户端消息
            data = await websocket.receive_text()
            # 这里可以处理客户端发送的消息，目前不需要
    except WebSocketDisconnect:
        status_broadcaster.disconnect(websocket)


@app.get("/")
async def root():
    return {"message": "DouyinLiveRecorder API服务"}


# 更新状态的函数，将由main.py调用
async def update_status(status_data: dict):
    await status_broadcaster.broadcast(status_data)


def start_server(host="127.0.0.1", port=8000):
    """启动FastAPI服务器"""
    uvicorn.run(app, host=host, port=port) 