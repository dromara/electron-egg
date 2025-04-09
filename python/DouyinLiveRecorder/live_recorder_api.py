import asyncio
import uvicorn
import json
import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

app = FastAPI(title="直播录制API服务", description="抖音直播录制相关API服务")

# 配置文件路径
url_config_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "URL.ini")
text_encoding = "utf-8"

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


# WebSocket路由
@app.websocket("/ws/recorder/status")
async def recorder_status_websocket(websocket: WebSocket):
    await status_broadcaster.connect(websocket)
    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_json()
            
            # 处理添加url的消息
            if data.get("type") == "url/add":
                try:
                    url = data.get("url")
                    if url:
                        with open(url_config_file, 'w', encoding=text_encoding) as file:
                            file.write(url)
                        await websocket.send_json({
                            "type": "url/add/response",
                            "success": True,
                            "message": "直播链接已保存"
                        })
                    else:
                        await websocket.send_json({
                            "type": "url/add/response", 
                            "success": False,
                            "message": "URL不能为空"
                        })
                except Exception as e:
                    await websocket.send_json({
                        "type": "url/add/response",
                        "success": False, 
                        "message": f"保存直播链接失败: {str(e)}"
                    })
    except WebSocketDisconnect:
        status_broadcaster.disconnect(websocket)


@app.get("/")
async def root():
    return {"message": "DouyinLiveRecorder API服务", "version": "1.0.0"}


# 更新状态的函数，将由main.py调用
async def update_status(status_data: dict):
    await status_broadcaster.broadcast(status_data)


if __name__ == "__main__":
    uvicorn.run("live_recorder_api:app") 