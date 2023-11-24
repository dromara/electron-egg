package router

import (
	"electron-egg/api"

	eRouter "github.com/wallace5303/ee-go/ehttp/router"
)

func Api() {

	// 注册路由
	eRouter.Handle("GET", "/api/hello", api.Hello)
	eRouter.Handle("GET", "/api/exit", api.Exit)

	// 使用 gin 注册路由
	eRouter.GinRouter.GET("/api/info", api.Info)
}
