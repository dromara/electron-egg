package controller

import (
	"github.com/gin-gonic/gin"

	"ee-go/econtroller"
)

type UserController struct {
	econtroller.Controller
}

func (c *UserController) GetName(ctx *gin.Context) {
	c.Init(ctx)

	c.ReturnJson(0, "success", "hello eego")
}

// func GetName(c *gin.Context) {
// 	ret := newResult()
// 	defer c.JSON(http.StatusOK, ret)

// 	ret.Data = "gsx"
// }

// func GetAge(c *gin.Context) {
// 	ret := newResult()
// 	defer c.JSON(http.StatusOK, ret)

// 	ret.Data = 12
// }
