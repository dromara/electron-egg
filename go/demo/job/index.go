package job

import (
	"time"

	"github.com/wallace5303/ee-go/elog"
	"github.com/wallace5303/ee-go/eruntime"
	"github.com/wallace5303/ee-go/etask"
	"github.com/wallace5303/ee-go/eutil"
)

var (
	checkStatusInterval = 5
)

func Boot() {
	if eruntime.IsDev() {
		checkStatusInterval = 2
	}
	go etask.Every(1000*time.Millisecond, etask.ExecTask)
	go etask.Every(time.Duration(checkStatusInterval)*time.Second, etask.Status)

	// test task
	AddTestTask()
}

func AddTestTask() {
	count := 10
	for i := 0; i < count; i++ {
		etask.AddTask("task.demo", hello)
	}
}

func hello() {
	defer eutil.Recover()
	elog.Logger.Info("[task] hello")
}
