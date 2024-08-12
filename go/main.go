package main

import (
	"embed"

	"github.com/wallace5303/ee-go/eboot"

	"electron-egg/demo"
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

	// demo
	demo.Index()

	// ee-go runtime
	ego.Run()
}
