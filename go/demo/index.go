package demo

import (
	"electron-egg/demo/job"
	//"electron-egg/demo/sql/sqlitelib"
	"electron-egg/demo/util"

	"github.com/wallace5303/ee-go/eapp"
	"github.com/wallace5303/ee-go/elog"
)

// 使用 router Ctx
func Index() {
	elog.Logger.Info("Start Demo")

	// 初始化基础数据
	util.Boot()
	// 初始化数据库
	//sqlitelib.InitDB(false)
	// 初始化任务
	job.Boot()
	// 注册关闭前的处理函数
	eapp.Register("beforeClose", func() {
		//sqlitelib.CloseDatabase()
	})
}
