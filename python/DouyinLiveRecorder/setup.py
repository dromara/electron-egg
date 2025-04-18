from cx_Freeze import setup, Executable
import sys
import os
from pathlib import Path

# 创建可执行文件的配置
executableApp = Executable(
    script="live_recorder_api.py",
    target_name="DouyinLiveRecorder",
)

# 依赖项列表
packages = [
    # 主要依赖包
    "requests",
    "loguru",
    "pycryptodome",
    "distro",
    "tqdm",
    "httpx",
    "PyExecJS",
    
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
]

# 需要排除的项
excludes = [
    "tkinter",
    "unittest",
    "email",
    "html",
    "http",
    "xml",
    "pydoc",
]

# 包含的文件
include_files = [
]

# 确定构建目录，将是setup.py所在目录下的build
build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "build"))
build_exe_dir = os.path.join(build_dir, "exe." + sys.platform)

# 确保目录存在
Path(build_dir).mkdir(exist_ok=True)
Path(build_exe_dir).mkdir(exist_ok=True)

# Windows平台特定配置
if sys.platform == "win32":
    executables = [
        Executable(
            "main.py",
            target_name="DouyinLiveWebFetcher.exe",
            base="console",
            icon=None,  # 如果有图标，可以指定
        )
    ]

# 配置选项
build_exe_options = {
    "packages": packages,
    "excludes": excludes,
    "include_files": include_files,
    "optimize": 2,  # 代码优化级别
    "include_msvcr": True,  # 仅Windows下有效，包含MSVC运行时
    "build_exe": build_exe_dir,  # 指定输出目录
}

# 设置
setup(
    name="DouyinLiveRecorder",
    version="1.0.0",
    description="抖音直播弹幕获取工具",
    author="bubu",
    options={"build_exe": build_exe_options},
    executables=executables,
)

print("构建完成！可执行文件位于:", build_exe_dir)
print("使用方法: ")
print("  1. 命令行运行: DouyinLiveWebFetcher [--port=端口号]")
print("  2. 默认端口为7074") 