package sqlitelib

import (
	"database/sql"
	"fmt"
	"strings"

	"electron-egg/demo/util"

	"github.com/wallace5303/ee-go/elog"
)

type Stat struct {
	Key string `json:"key"`
	Val string `json:"value"`
}

const (
	dbVersionName = "duola_database_version"
)

func GetDatabaseVer() (ret string) {
	stmt := "SELECT value FROM stat WHERE `key` = '" + dbVersionName + "'"
	row := db.QueryRow(stmt)
	if err := row.Scan(&ret); nil != err {
		if !strings.Contains(err.Error(), "no such table") {
			elog.Logger.Errorf("query database version failed: %s", err)
		}
	}

	return
}

func setDatabaseVer() {
	key := dbVersionName
	tx, err := beginTx()
	if err != nil {
		return
	}
	if err = PutStat(tx, key, util.DatabaseVer); err != nil {
		return
	}
	commitTx(tx)
}

func PutStat(tx *sql.Tx, key, value string) (err error) {
	stmt := "DELETE FROM stat WHERE `key` = '" + key + "'"
	if err = execStmtTx(tx, stmt); err != nil {
		return
	}

	stmt = "INSERT INTO stat VALUES ('" + key + "', '" + value + "')"
	err = execStmtTx(tx, stmt)
	return
}

func GetStat(key string) (ret string) {
	stmt := "SELECT value FROM stat WHERE `key` = '" + key + "'"
	row := queryRow(stmt)
	row.Scan(&ret)
	return
}

func SetStatData(key string, value any) (err error) {
	tx, bErr := beginTx()
	if bErr != nil {
		fmt.Printf("SetStatData bErr %v\n", bErr)
		return
	}

	stmt := "DELETE FROM stat WHERE `key` = '" + key + "'"
	if err = execStmtTx(tx, stmt); err != nil {
		return
	}

	stmt = "INSERT INTO stat (key, value) VALUES (?, ?)"
	err = execStmtTx(tx, stmt, key, value)
	if err != nil {
		return
	}

	commitTx(tx)
	return
}
