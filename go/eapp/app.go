package eapp

import (
	"bytes"
	"errors"
	"flag"
	"fmt"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"strings"

	"electron-egg/eerror"
	"electron-egg/eutil"
)

const (
	Version = "0.1.0"
)

var (
	ENV = "prod" // 'dev' 'prod'
	// progressBar  float64 // 0 ~ 100
	// progressDesc string  // description
	HttpServer = false
	AppName    = ""
)

var (
	BaseDir, _     = os.Getwd()
	HomeDir        string // electron-egg home directory
	PublicDir      string // electron-egg public directory
	UserHomeDir    string // OS user home directory
	AppUserDataDir string // electron app.getPath('userData')
)

func New() {
	fmt.Println("new electron-egg for go")

	eeEnv := flag.String("ee-env", "prod", "dev/prod")
	eeName := flag.String("ee-name", "", "app name")
	eeAppUserData := flag.String("ee-app-user-data", "", "The folder where you store your application configuration files")
	flag.Parse()

	ENV = *eeEnv
	AppName = *eeName
	AppUserDataDir = *eeAppUserData

	if AppName == "" {
		eerror.Throw("The software ee-name must be set")
	}

	fmt.Println("ENV:", ENV)
	fmt.Println("AppName:", AppName)
	fmt.Println("AppUserDataDir:", AppUserDataDir)

	initDirectory()

	//logger := elog.GetLogger()
	//logger := elog.CreateLogger()
	// logger.Infof("hconf example success tttt")
}

// Pwd gets the path of current working directory.
func Pwd() string {
	file, _ := exec.LookPath(os.Args[0])
	pwd, _ := filepath.Abs(file)

	return filepath.Dir(pwd)
}

func initDirectory() {
	HomeDir = filepath.Join(BaseDir, "..")
	PublicDir = filepath.Join(HomeDir, "public")
	UserHomeDir, _ = getUserHomeDir()
	userHomeConfDir := filepath.Join(UserHomeDir, ".config", AppName)
	//workDataConf := filepath.Join(userHomeConfDir, "workdata.json")
	if !eutil.FileIsExist(userHomeConfDir) {
		if err := os.MkdirAll(userHomeConfDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create user home conf folder [%s] failed: %s", userHomeConfDir, err)
			eerror.Throw(errMsg)
		}
	}

	logDir := filepath.Join(HomeDir, "logs")
	if ENV == "prod" {
		logDir = filepath.Join(AppUserDataDir, "logs")
		if AppUserDataDir != "" && eutil.FileIsExist(AppUserDataDir) {
			logDir = filepath.Join(AppUserDataDir, "logs")
		}
	}
	if !eutil.FileIsExist(logDir) {
		if err := os.MkdirAll(logDir, 0755); err != nil && !os.IsExist(err) {
			errMsg := fmt.Sprintf("create logs folder [%s] failed: %s", logDir, err)
			eerror.Throw(errMsg)
		}
	}

	fmt.Println("HomeDir:", HomeDir)
	fmt.Println("PublicDir:", PublicDir)
	fmt.Println("UserHomeDir:", UserHomeDir)
	fmt.Println("userHomeConfDir:", userHomeConfDir)
	fmt.Println("logDir:", logDir)
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
