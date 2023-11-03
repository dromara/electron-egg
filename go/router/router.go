package api

import (
	"electron-egg/api"

	"github.com/gin-gonic/gin"
)

func ServeAPI(ginServer *gin.Engine) {
	ginServer.Handle("GET", "/api/user/getName", api.GetName)
	ginServer.Handle("GET", "/api/user/getAge", api.GetAge)
}
