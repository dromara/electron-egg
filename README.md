# electron-egg 
[![star](https://gitee.com/wallace5303/electron-egg/badge/star.svg?theme=gvp)](https://gitee.com/wallace5303/electron-egg/stargazers)

一个入门简单、快速高效、功能丰富的JS跨平台桌面软件开发框架。

- 愿景：所有开发者都能学会桌面软件研发
- 🏆 码云最有价值开源项目
- gitee：https://gitee.com/wallace5303/electron-egg
- github：https://github.com/wallace5303/electron-egg
- 为什么使用？桌面软件（办公方向、 个人工具），仍然是未来十几年PC端需求之一，提高工作效率


## 文档
- [教程文档](https://www.yuque.com/u34495/mivcfg/xnhmms)
- 文档进行了重新编写，更加直观，一定要看！！！

## 特性
1. 跨平台：一套代码，可以打包成windows版、Mac版、Linux版或者以web网站运行
2. 简单高效：只需学习js语言，同时支持vue、react、ejs等前端技术
3. 工程化：可以用服务端的开发思维，来编写桌面软件
4. 高性能：可启动多个工作进程
5. 功能丰富：服务端的技术场景，如：路由、中间件、控制器、服务、定时任务、队列、插件等
6. 功能demo：桌面软件常见功能，后续逐步集成或提供demo
7. 更多功能请看文档

## 使用场景

### 1. 常规桌面软件
- demo

    ![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/home.png)
    ![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/socket.png)
    ![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/xm-pic-config.png)

### 2. 游戏（h5相关技术开发）
- 忍者100层

    ![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/ee_game_1.png)

### 3. 任意网站变桌面软件
- Youtube

    ![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/youtub.png)
- discuz-q论坛

    ![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/dq-feed.png)

### 4. web项目
- 网站助手：http://b.kaka996.com/

    ![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/web-helper.png)


## 开始使用

1. 下载
    ```
    # gitee
    git clone https://gitee.com/wallace5303/electron-egg.git
    # github
    git clone https://github.com/wallace5303/electron-egg.git
    ```

2. 安装，node推荐v14.16.0
    ```
    # 提升安装速度，使用国内镜像；
    npm config set registry https://registry.npm.taobao.org
    # 进入目录 ./electron-egg/
    npm install
    ```
    
3. 常用命令
    ```
    # 开发者模式
        # 1：【进入前端目录】，启动vue
        cd frontend && npm install && npm run serve
        
        # 2：【根目录】，启动后端服务
        cd ../ && npm run dev

    # 预发布模式（环境变量为：prod）
    npm run start

    # 打包-windows版本
    npm run build-w (32位)
    npm run build-w-64 (64位)

    # 打包-mac版本
    npm run build-m
    npm run build-m-arm64 (苹果M1芯片架构)

    # 打包-linux版本
    npm run build-l

    # web运行-开发模式
    npm run web-dev

    # web运行-生产者模式-启动
    npm run web-start

    # web运行-生产者模式-停止
    npm run web-stop
    ```

## 项目案例

1. [小明云存储](https://gitee.com/wallace5303/xm-pic)

![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/xm-pic-config.png)

![](https://kaka996.coding.net/p/resource/d/tx-resource/git/raw/master/img/electron-egg/xm-pic-detail.png)

## 交流
1. qq群：735532437

## 关于pr
请前往[GitHub项目](https://github.com/wallace5303/electron-egg)提pr（避免代码同步后，pr被覆盖掉），感谢！

地址：https://github.com/wallace5303/electron-egg

## 感谢star



