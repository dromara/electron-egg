package logger

import (
	"os"
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	l            *Logger
	outWrite     zapcore.WriteSyncer       // IO输出
	debugConsole = zapcore.Lock(os.Stdout) // 控制台标准输出
	once         sync.Once
)

type Logger struct {
	*zap.Logger
	zapConfig zap.Config
}
