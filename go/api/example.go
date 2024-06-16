package api

import (
	"net/http"

	"github.com/wallace5303/ee-go/eapp"
	"github.com/wallace5303/ee-go/ehelper"
	"github.com/wallace5303/ee-go/ehttp/router"
	"github.com/wallace5303/ee-go/elog"

	"github.com/gin-gonic/gin"
)

// 使用 router Ctx
func Hello(c *router.Ctx) {
	ret := ehelper.GetJson()
	defer c.JSON(ret)

	ret.Data = "hello electron-egg"
	elog.Logger.Info(" print Hello ")
}

// 使用 gin Context
func Info(gc *gin.Context) {
	ret := ehelper.GetJson()
	defer gc.JSON(http.StatusOK, ret)

	elog.Logger.Info(" print Info ")
}
