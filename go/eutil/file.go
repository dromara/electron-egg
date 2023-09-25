package eutil

import "os"

func FileIsExist(path string) bool {
	_, err := os.Stat(path)

	return err == nil || os.IsExist(err)
}
