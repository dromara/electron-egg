from cx_Freeze import setup, Executable
import sys
import os
from pathlib import Path

# 创建可执行文件的配置
executableApp = Executable(
    script="DouyinLiveRecorder/live_recorder_api.py",
    target_name="DouyinLiveRecorder",
)

# 打包的参数配置
options = {
    "build_exe": {
        "build_exe":"./dist/",
        "excludes": ["PySide6", "PyQt5", "PyQt6", "PySide2", "tkinter"],
        "include_files": [
            ("DouyinLiveRecorder/config", "config"),
            ("DouyinLiveRecorder/douyinliverecorder", "douyinliverecorder")
        ],
        "packages": [
    # 主要依赖包
    "requests",
    "loguru",
    "Crypto",
    "distro",
    "tqdm",
    "httpx",
    "execjs",
    
    # API服务相关
    "fastapi",
    "uvicorn",
    "websockets",
    
    # live_recorder_api.py中的依赖
    "argparse",
    "typing",
    "asyncio",
    "json",
    "threading",
    "time",
    "sys",
    "os",
    
    # CORS中间件
    "fastapi.middleware",
    "fastapi.middleware.cors",
    
    # 响应类型
    "fastapi.responses",
    
    # 其他标准库
    "datetime",
    "configparser",
    "re",
    "urllib",
    "pathlib",
    "subprocess",
    "signal",
    "uuid",
    "shutil",
    "builtins"
],
        "optimize": 2,
    }
}
setup(
    name="DouyinLiveRecorder",
    version="1.0",
    description="抖音直播弹幕获取工具",
    options=options,
    executables=[executableApp]
)