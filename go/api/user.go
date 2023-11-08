package api

import (
	"ee-go/eruntime"
	"ee-go/eserver"

	// "ee-go/gin"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetName(ctx *gin.Context) {
	ret := eserver.NewJson()
	defer ctx.JSON(http.StatusOK, ret)
}

func Exit(ctx *gin.Context) {
	ret := eserver.NewJson()
	defer ctx.JSON(http.StatusOK, ret)

	eruntime.Close()
}
