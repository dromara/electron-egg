from cx_Freeze import setup, Executable
import sys
import os
from pathlib import Path

# 创建可执行文件的配置
executableApp = Executable(
    script="DouyinLiveWebFetcher/main.py",
    target_name="DouyinLiveWebFetcher",
)

# 打包的参数配置
options = {
    "build_exe": {
        "build_exe":"./dist/",
        "excludes": ["PySide6", "PyQt5", "PyQt6", "PySide2", "tkinter"],
        "includes": ["liveMan"],
        "packages": ["uvicorn", "fastapi", "starlette", "pydantic", "py_mini_racer", "websocket", "sse_starlette"],
        "optimize": 2,
    }
}
setup(
    name="DouyinLiveWebFetcher",
    version="1.0",
    description="python app",
    options=options,
    executables=[executableApp]
)