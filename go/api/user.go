package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Result struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func newResult() *Result {
	return &Result{
		Code: 0,
		Msg:  "",
		Data: nil,
	}
}

func GetName(c *gin.Context) {
	ret := newResult()
	defer c.JSON(http.StatusOK, ret)

	ret.Data = "gsx"
}

func GetAge(c *gin.Context) {
	ret := newResult()
	defer c.JSON(http.StatusOK, ret)

	ret.Data = 12
}
