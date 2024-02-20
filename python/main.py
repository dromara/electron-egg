import argparse
import asyncio
from hypercorn.config import Config
from hypercorn.asyncio import serve

import uvicorn
from fastapi import FastAPI

app = FastAPI()

# argparse
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--port', type=int, default=7074, help='The port number.')
args = parser.parse_args()

@app.get("/")
async def index():
    """
    注册一个根路径
    :return:
    """
    return {"message": "Hello World"}


@app.get("/info")
async def info():
    """
    项目信息
    :return:
    """
    return {
        "app_name": "FastAPI框架学习",
        "app_version": "v0.0.1"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=args.port)
    # Handler = http.server.SimpleHTTPRequestHandler
    # with socketserver.TCPServer(("127.0.0.1", args.port), Handler) as httpd:
    #     print("Serving at port", args.port)
    #     httpd.serve_forever()
    # config = Config()
    # config.bind = ["127.0.0.1:" + str(args.port)]  # As an example configuration setting
    # asyncio.run(serve(app, config))

print("Serving at port", args.port)