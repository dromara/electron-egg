from flask import Flask, request, jsonify
from flask_cors import CORS
import argparse
import signal
import threading
import sys

# flask-demo

# argparse
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--port', type=int, default=7074, help='The port number.')
args = parser.parse_args()

app = Flask(__name__)

# 配置 CORS，允许所有来源
CORS(app)

# 定义路由和处理器
@app.route('/', methods=['GET'])
def index():
    name = request.args.get('name', 'World')
    return jsonify({'message': f'Hello, {name}!'}), 200


@app.route('/api/hello', methods=['GET'])
def hello():
    name = request.args.get('name', 'World')
    return jsonify({'message': f'Hello, {name}!'}), 200

# 通过信号来退出服务，否则会出现终端显示退出后，实际进程仍在运行
# 定义信号处理函数
def signal_handler(sig, frame):
    print("Received signal to terminate the server.")

    # 关闭 Flask 应用
    # func = request.environ.get('werkzeug.server.shutdown')
    # if func is None:
    #     func = lambda: None
    # func()

    # 退出主线程
    # threading.main_thread().exit()
    sys.exit(0)

# 注册信号处理函数
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

if __name__ == '__main__':
    # 以api方式启动服务会出现警告，请忽略
    app.run(port=args.port)

# 控制台默认关闭输出信息，如果想要查看控制台输出，请单独启动服务 npm run dev-python
print("python server is running at port:", args.port)

