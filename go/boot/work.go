package eboot

const (
	Version = "0.1.0"
)

var (
	ENV          = "dev" // 'dev' 'prod'
	progressBar  float64 // 0~100
	progressDesc string  // Description
	HttpServer   = false
)

func Run() {
	elog.NewLogger()
	elog.GetLogger().Info("hconf example success tttt")
}
