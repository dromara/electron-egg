package main

import (
	"embed"

	"ee-go/eboot"

	"electron-egg/router"
)

var (
	//go:embed public/**
	staticFS embed.FS
)

func main() {
	// Initialize new ee-go
	eboot.New(staticFS)

	// User business logic
	router.Init()

	// ee-go runtime
	eboot.Run()
}
