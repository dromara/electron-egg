package main

import (
	"ee-go/eboot"

	"electron-egg/router"
)

func main() {
	// Initialize ee-go
	eboot.Init()

	// User business logic
	router.Load()

	// ee-go runtime
	eboot.Run()
}
