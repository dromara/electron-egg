package router

import (
	"electron-egg/api"

	"ee-go/eserver"
)

func Load() {
	// userContr := controller.UserController{}
	// eserver.Gin.GET("/api/user/getName", userContr.GetName)

	eserver.Router.Handle("GET", "/api/user/getName", api.GetName)
	eserver.Router.Handle("GET", "/api/user/exit", api.Exit)
}

// func InitFunc() {
// 	return func(g *gin.Engine) {
// 		eserver.Gin.Handle("GET", "/api/user/getName", api.GetName)
// 	}
// }
