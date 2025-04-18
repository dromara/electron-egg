#!/usr/bin/env python
import os
import sys
import subprocess

def main():
    # 构建命令行
    cmd = [
        sys.executable,  # 当前Python解释器路径
        "-m",
        "nuitka",
        "--onefile",  # 单文件模式
        "--follow-imports",  # 自动包含所有导入
        "--include-package=uvicorn,fastapi,starlette,pydantic",  # 包含必要的包
        "--output-dir=dist",  # 输出目录
        "live_recorder_api.py"  # 要打包的主文件
    ]
    
    # 执行命令
    print("开始打包...")
    subprocess.call(cmd)
    print("打包完成！")

if __name__ == "__main__":
    main() 