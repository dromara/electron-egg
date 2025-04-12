from cx_Freeze import setup, Executable

# 创建可执行文件的配置
executableApp = Executable(
    script="fastapi-demo.py",
    target_name="pyapp",
)

# 打包的参数配置
options = {
    "build_exe": {
        "build_exe":"./dist/",
        "includes": [
            "uvicorn.loops.auto", 
            "uvicorn", 
            "fastapi",
            "fastapi.middleware",
            "fastapi.middleware.cors",
            "starlette",
            "starlette.middleware",
            "starlette.middleware.cors",
            "uvicorn.protocols",
            "uvicorn.protocols.http",
            "uvicorn.protocols.http.auto",
            "uvicorn.protocols.http.h11_impl",
            "uvicorn.protocols.http.httptools_impl",
            "uvicorn.protocols.websockets",
            "uvicorn.protocols.websockets.auto",
            "uvicorn.protocols.websockets.websockets_impl",
            "uvicorn.protocols.websockets.wsproto_impl",
            "uvicorn.lifespan",
            "uvicorn.lifespan.on",
            "uvicorn.lifespan.off",
            "h11",
            "websockets"
        ],
        "excludes": ["PySide6", "PyQt5", "PyQt6", "PySide2", "tkinter"],
        "optimize": 2,
    }
}

setup(
    name="pyapp",
    version="1.0",
    description="python app",
    options=options,
    executables=[executableApp]
)