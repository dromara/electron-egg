package main

import (
	"ee-go/eboot"
	"fmt"

	"electron-egg/router"
)

func main() {
	eboot.Init()
	fmt.Println("dd")
	router.Load()
	eboot.Run()
}
