package eapp

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"strings"

	"electron-egg/elog"
	"electron-egg/eutil"
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

var (
	BaseDir, _  = os.Getwd()
	HomeDir     string // electron-egg home directory
	PublicDir   string // electron-egg public directory
	LogDir      string // electron-egg logs directory
	UserHomeDir string // OS user home directory
)

func init() {
	HomeDir = filepath.Join(BaseDir, "..")
	PublicDir = filepath.Join(HomeDir, "public")
	UserHomeDir, _ = getUserHomeDir()
}

func Run() {
	fmt.Println("result:")
	logger := elog.GetLogger()
	//logger := elog.CreateLogger()
	logger.Infof("hconf example success tttt")
}

// Pwd gets the path of current working directory.
func Pwd() string {
	file, _ := exec.LookPath(os.Args[0])
	pwd, _ := filepath.Abs(file)

	return filepath.Dir(pwd)
}

func getUserHomeDir() (string, error) {
	user, err := user.Current()
	if nil == err {
		return user.HomeDir, nil
	}

	// cross compile support
	if eutil.IsWindows() {
		return homeWindows()
	}

	// Unix-like system, so just assume Unix
	return homeUnix()
}

func homeUnix() (string, error) {
	// First prefer the HOME environmental variable
	if home := os.Getenv("HOME"); home != "" {
		return home, nil
	}

	// If that fails, try the shell
	var stdout bytes.Buffer
	cmd := exec.Command("sh", "-c", "eval echo ~$USER")
	cmd.Stdout = &stdout
	if err := cmd.Run(); err != nil {
		return "", err
	}

	result := strings.TrimSpace(stdout.String())
	if result == "" {
		return "", errors.New("blank output when reading home directory")
	}

	return result, nil
}

func homeWindows() (string, error) {
	drive := os.Getenv("HOMEDRIVE")
	path := os.Getenv("HOMEPATH")
	home := drive + path
	if drive == "" || path == "" {
		home = os.Getenv("USERPROFILE")
	}
	if home == "" {
		return "", errors.New("HOMEDRIVE, HOMEPATH, and USERPROFILE are blank")
	}

	return home, nil
}
