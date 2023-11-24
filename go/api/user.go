package api

import (
	"net/http"

	"ee-go/eapp"
	"ee-go/ehelper"
	"ee-go/ehttp/router"

	"github.com/gin-gonic/gin"
)

// 使用 router Ctx
func Hello(c *router.Ctx) {
	ret := ehelper.GetJson()
	ret.Data = "hello electron-egg"

	defer c.JSON(ret)
}

// 使用 gin Context
func Info(gc *gin.Context) {
	ret := ehelper.GetJson()
	defer gc.JSON(http.StatusOK, ret)
}

func Exit(c *router.Ctx) {
	ret := ehelper.GetJson()
	defer c.JSON(ret)

	eapp.Close()
}
