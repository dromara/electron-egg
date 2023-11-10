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
	// Initialize ee-go
	eboot.Init(staticFS)

	// User business logic
	router.Init()

	// ee-go runtime
	eboot.Run()
}
