package eerror

import (
	"fmt"
	"os"

	E "github.com/pkg/errors"
)

func Throw(msg string) {
	throw(msg, nil, 0)
}

func ThrowWrap(msg string, err error) {
	throw(msg, err, 0)
}

func throw(msg string, err error, code int) {
	var errInfo error
	if err != nil {
		errInfo = E.Wrap(err, msg)
	} else {
		errInfo = E.New(msg)
	}

	fmt.Printf("Error: %+v", errInfo)
	os.Exit(code)
}
