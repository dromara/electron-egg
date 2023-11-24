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
	ego := eboot.New(staticFS)

	// User business logic
	router.Api()

	// ee-go runtime
	ego.Run()
}
