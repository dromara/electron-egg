package api

import (
	"net/http"

	"github.com/wallace5303/ee-go/eapp"
	"github.com/wallace5303/ee-go/ehelper"
	"github.com/wallace5303/ee-go/ehttp/router"
	"github.com/wallace5303/ee-go/elog"

	"github.com/gin-gonic/gin"
	//"electron-egg/demo/sql/sqlitelib"
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

	elog.Logger.Info(" print info ")
}

func Exit(c *router.Ctx) {
	ret := ehelper.GetJson()
	defer c.JSON(ret)

	eapp.Close()
}

func SetValue(c *router.Ctx) {
	ret := ehelper.GetJson()
	defer c.JSON(ret)

	// arg, ok := c.ArgJson()
	// if !ok {
	// 	return
	// }

	// keyName := arg["key"].(string)
	// vallue := arg["value"]

	// sqlitelib.SetStatData(keyName, vallue)
}

func GetValue(c *router.Ctx) {
	ret := ehelper.GetJson()
	defer c.JSON(ret)

	// arg, ok := c.ArgJson()
	// if !ok {
	// 	return
	// }

	// keyName := arg["key"].(string)

	// ret.Data = sqlitelib.GetStat(keyName)
}
