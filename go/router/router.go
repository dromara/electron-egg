package router

import (
	eRouter "ee-go/ehttp/router"
	"electron-egg/api"
)

func Api() {

	// 注册路由
	eRouter.Handle("GET", "/api/hello", api.Hello)
	eRouter.Handle("GET", "/api/exit", api.Exit)

	// 使用 gin 注册路由
	eRouter.GinRouter.GET("/api/info", api.Info)
}
