package api

import (
	"net/http"
	"time"

	"ee-go/eapp"
	"ee-go/ehelper"
	"ee-go/ehttp/router"
	"ee-go/elog"

	"github.com/gin-gonic/gin"
)

// 使用 router Ctx
func Hello(c *router.Ctx) {
	ret := ehelper.GetJson()
	defer c.JSON(ret)

	ret.Data = "hello electron-egg"
	elog.Logger.Info(" print Hello ")
	time.Sleep(5 * time.Second)
}

// 使用 gin Context
func Info(gc *gin.Context) {
	ret := ehelper.GetJson()
	defer gc.JSON(http.StatusOK, ret)

	elog.Logger.Info(" print info ")
}

func Exit(c *router.Ctx) {
	ret := ehelper.GetJson()
	defer c.JSON(ret)

	eapp.Close()
}
