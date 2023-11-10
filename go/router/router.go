package router

import (
	"ee-go/eserver"
	"electron-egg/api"
)

func Api() {
	eserver.Router.Handle("GET", "/api/test", api.GetName)
	eserver.Router.Handle("GET", "/api/exit", api.Exit)
}
