package router

import (
	"electron-egg/api"

	"github.com/gin-contrib/cors"
	eRouter "github.com/wallace5303/ee-go/ehttp/router"
)

func Api() {
	eRouter.GinRouter.Use(cors.Default())
	// 使用 gin 注册路由
	eRouter.GinRouter.GET("/api/info", api.Info)
}
