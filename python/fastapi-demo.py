import argparse
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# 添加CORS中间件，允许跨域请求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有源，生产环境应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有HTTP方法
    allow_headers=["*"],  # 允许所有HTTP头
)

# argparse
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--port', type=int, default=7074, help='The port number.')
args = parser.parse_args()

@app.get("/")
async def index():
    return {"message": "Hello World"}

@app.get("/api/hello")
async def hello():
    return {
        "app_name": "FastAPI框架学习",
        "app_version": "v0.0.1"
    }

if __name__ == "__main__":
    # uvicorn会多创建一个进程，并且stdio独立于控制台，如果（开发时）出现进程没有关闭，可尝试关闭终端
    uvicorn.run(app, host="127.0.0.1", port=args.port)

# 控制台默认关闭输出信息，如果想要查看控制台输出，请单独启动服务 npm run dev-python
print("python server is running at port:", args.port)