package router

import (
	"electron-egg/api"

	"ee-go/eserver"
)

func Load() {
	eserver.Router.Handle("GET", "/api/user/getName", api.GetName)
	eserver.Router.Handle("GET", "/api/user/exit", api.Exit)
}
