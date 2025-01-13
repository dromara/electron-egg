package util

import (
	"os"
	"path/filepath"

	"github.com/wallace5303/ee-go/elog"
	"github.com/wallace5303/ee-go/eruntime"
)

// 基础
const (
	Version   = "0.1.0"
	LocalHost = "127.0.0.1" // 伺服地址

	// DatabaseVer 数据库版本
	DatabaseVer = "20240101"
)

// 初始化
var (
	DBName = "ee.db"
	DBPath string // SQLite 数据库文件路径

	ConfDir  string // 用户配置目录路径
	LocalDir string // 用户数据目录路径
	DBDir    string // 用户DB目录路径
	TmpDir   string // 用户临时目录路径
)

func Boot() {
	initPathDir()
}

func initPathDir() {
	ConfDir = filepath.Join(eruntime.DataDir, "conf")
	LocalDir = filepath.Join(eruntime.DataDir, "local")
	DBDir = filepath.Join(eruntime.DataDir, "db")
	DBPath = filepath.Join(DBDir, DBName)
	TmpDir = eruntime.TmpDir
	// 创建
	createDir()
}

func createDir() {
	if err := os.MkdirAll(ConfDir, 0755); nil != err && !os.IsExist(err) {
		elog.Logger.Errorf("create conf folder [%s] failed: %s", ConfDir, err)
	}
	if err := os.MkdirAll(LocalDir, 0755); nil != err && !os.IsExist(err) {
		elog.Logger.Errorf("create data folder [%s] failed: %s", LocalDir, err)
	}
	if err := os.MkdirAll(TmpDir, 0755); nil != err && !os.IsExist(err) {
		elog.Logger.Errorf("create tmp folder [%s] failed: %s", TmpDir, err)
	}
	if err := os.MkdirAll(DBDir, 0755); nil != err && !os.IsExist(err) {
		elog.Logger.Errorf("create db folder [%s] failed: %s", DBDir, err)
	}
}
