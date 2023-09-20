package eboot

import (
	"fmt"

	"electron-egg/elog"
)

const (
	Version = "0.1.0"
)

var (
	ENV = "dev" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
	HttpServer = false
)

func Run() {
	fmt.Println("result:")
	logger := elog.GetLogger()
	//logger := elog.CreateLogger()
	logger.Infof("hconf example success tttt")
}
