from cx_Freeze import setup, Executable
import sys

# relieve stack overflow
sys.setrecursionlimit(5000)

# 创建可执行文件的配置
executableApp = Executable(
    script="main.py",
    target_name="pyapp",
)

# 打包的参数配置
options = {
    "build_exe": {
        "build_exe":"./dist/",
        "excludes": ["*.txt"],
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