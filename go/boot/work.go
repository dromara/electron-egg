package boot

import "fmt"

const (
	Version = "0.1.0"
)

var (
	ENV          = "dev" // 'dev' 'prod'
	progressBar  float64 // 0 ~ 100
	progressDesc string  // description
	HttpServer   = false
)

func Run() {
	fmt.Println("result:")
	// elog.NewLogger()
	// elog.GetLogger().Info("hconf example success tttt")
}
