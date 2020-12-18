# electron-egg
一个简单、快速、功能丰富的桌面软件开发框架，基于electron和egg.js

[官网: http://b.kaka996.com/](http://b.kaka996.com/)

[文档迁移到了羽雀](https://www.yuque.com/u34495/mivcfg/xnhmms)

## 特性
1. 直接打包成windows版、Mac版、Linux版或者以web网站运行。
2. 可以用服务端的开发思维，来编写桌面软件。
3. 也可以用前端来开发，数据服务请求外部api即可。
4. 服务端的技术场景几乎都可以使用，如：路由、中间件、控制器、服务、定时任务、队列、插件等。
5. 桌面软件常见功能，后续逐步集成并完善或提供demo。
6. 软件自动更新。

## 默认UI

- 使用vue编写，经典三栏样式

![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/electron-egg-ui-1.png)

## 开始使用

1. 下载
    ```
    # gitee
    git clone https://gitee.com/wallace5303/electron-egg.git
    # github
    git clone https://github.com/wallace5303/electron-egg.git
    ```

2. 启动
    ```
    # 进入目录 ./electron-egg/
    # 提升安装速度，使用国内镜像
    npm config set registry https://registry.npm.taobao.org
    npm install
    npm run dev
    ```
3. 常用命令
    ```
    # 开发者模式
    npm run dev

    # 生产者模式
    npm run start

    # 打包-windows版本
    npm run build-w

    # 打包-mac版本
    npm run build-m

    # 打包-linux版本
    npm run build-l

    # web运行-开发模式
    npm run web-dev

    # web运行-生产者模式-启动
    npm run web-start

    # web运行-生产者模式-停止
    npm run web-stop
    ```

## 项目demo

1. [网站助手-已开源](https://gitee.com/wallace5303/aweb-helper)

    web版&客户端
![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/box/js.gif)
![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/box/json.gif)

## 交流
1. qq群：735532437
2. 把一些常用或者重复的功能，做成桌面小工具，给自己或者别人用，确实省了不少时间^_^ 

## 进行中功能
1. 软件自动更新(已完成)
2. 默认UI(已完成)

## 欢迎star



