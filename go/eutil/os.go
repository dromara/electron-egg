package eutil

import (
	"runtime"

	"github.com/shirou/gopsutil/v3/host"
)

func IsWindows() bool {
	return runtime.GOOS == "windows"
}

func IsLinux() bool {
	return runtime.GOOS == "linux"
}

func IsMacOS() bool {
	return runtime.GOOS == "darwin"
}

func IsDarwin() bool {
	return runtime.GOOS == "darwin"
}

func OSPlatform() (plat string) {
	plat, _, _, err := host.PlatformInformation()
	if nil != err {
		return "Unknown"
	}
	return
}
