from flask import Flask, request, jsonify
import argparse

# argparse
parser = argparse.ArgumentParser(description='Process some integers.')
parser.add_argument('--port', type=int, default=7074, help='The port number.')
args = parser.parse_args()

app = Flask(__name__)

# 定义路由和处理器
@app.route('/', methods=['GET'])
def index():
    name = request.args.get('name', 'World')
    return jsonify({'message': f'Hello, {name}!'}), 200


@app.route('/api/hello', methods=['GET'])
def hello():
    name = request.args.get('name', 'World')
    return jsonify({'message': f'Hello, {name}!'}), 200

if __name__ == '__main__':
    app.run(port=args.port)

# 控制台默认关闭输出信息，如果想要查看控制台输出，请单独启动服务 npm run dev-python
print("python server is running at port:", args.port)