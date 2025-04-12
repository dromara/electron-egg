from cx_Freeze import setup, Executable
import sys
import os
from pathlib import Path

# 创建可执行文件的配置
executableApp = Executable(
    script="main.py",
    target_name="DouyinLiveWebFetcher",
)

# 依赖项列表
packages = [
    "requests",
    "betterproto",
    "websocket-client",
    "PyExecJS",
    "mini_racer",
    "fastapi",
    "uvicorn",
    "sse_starlette",
    "asyncio",
    "queue",
    "logging",
    "argparse",
    "json",
    "re",
    "codecs",
    "gzip",
    "hashlib",
    "random",
    "string",
    "subprocess",
    "threading",
    "time",
    "urllib.parse",
    "contextlib",
    "unittest.mock",
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
    "requirements.txt",
    "README.MD",
    "LICENSE",
    "sign.js",
    ".gitignore",
    ".gitattributes",
    "protobuf",
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
# macOS平台特定配置
elif sys.platform == "darwin":
    executables = [
        Executable(
            "main.py",
            target_name="DouyinLiveWebFetcher",
            base="console",
            icon=None,  # 如果有图标，可以指定
        )
    ]
# Linux平台特定配置
else:
    executables = [
        Executable(
            "main.py",
            target_name="DouyinLiveWebFetcher",
            base="console",
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
    name="DouyinLiveWebFetcher",
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