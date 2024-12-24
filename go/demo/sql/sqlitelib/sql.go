package sqlitelib

import (
	"database/sql"
	"errors"
	"os"
	"runtime"
	"runtime/debug"
	"strings"
	"sync"
	"time"

	"electron-egg/demo/util"

	"github.com/wallace5303/ee-go/ehelper"
	"github.com/wallace5303/ee-go/elog"

	_ "github.com/glebarez/go-sqlite"
)

var (
	db *sql.DB
)

var initDBLock = sync.Mutex{}

func InitDB(forceRebuild bool) (err error) {
	initDBLock.Lock()
	defer initDBLock.Unlock()

	elog.Logger.Infof("Init database")
	initDBConnection()

	if !forceRebuild {
		// 检查数据库结构版本，如果版本不一致的话说明改过表结构，需要重建
		dbVer := GetDatabaseVer()
		if util.DatabaseVer == dbVer {
			return
		}

		elog.Logger.Infof("rebuilding database ......")
	}

	// 不存在库或者版本不一致都会走到这里
	CloseDatabase()
	if ehelper.FileIsExist(util.DBPath) {
		if err = removeDatabaseFile(); err != nil {
			elog.Logger.Errorf("remove database file [%s] failed: %s", util.DBPath, err)

			err = nil
		}
	}

	initDBConnection()
	initDBTables()

	return
}

func initDBConnection() {
	if db != nil {
		CloseDatabase()
	}

	dsn := util.DBPath + "?_pragma=busy_timeout(7000)" +
		"&_pragma=journal_mode(WAL)" +
		"&_pragma=synchronous(1)" +
		"&_pragma=mmap_size(2684354560)" +
		"&_pragma=cache_size(-20480)" +
		"&_pragma=page_size(32768)" +
		"&_pragma=case_sensitive_like(OFF)"

	var err error
	db, err = sql.Open("sqlite", dsn)
	if err != nil {
		elog.Logger.Errorf("create database failed: %s", err)
	}
	elog.Logger.Infof("DB data source name: %s", dsn)

	db.SetMaxIdleConns(20)
	db.SetMaxOpenConns(20)
	db.SetConnMaxLifetime(365 * 24 * time.Hour)
}

func initDBTables() {
	elog.Logger.Infof("init tables ......")

	_, err := db.Exec("DROP TABLE IF EXISTS stat")
	if err != nil {
		elog.Logger.Errorf("drop table [stat] failed: %s", err)
	}
	_, err = db.Exec("CREATE TABLE stat ( key varchar ( 255 ) NOT NULL DEFAULT '', value text DEFAULT '', PRIMARY KEY ( key ) );")
	if err != nil {
		elog.Logger.Errorf("create table [stat] failed: %s", err)
	}

	_, err = db.Exec("DROP TABLE IF EXISTS storage")
	if err != nil {
		elog.Logger.Errorf("drop table [storage] failed: %s", err)
	}
	_, err = db.Exec("CREATE TABLE storage ( name varchar ( 255 ), value text, expires_time datetime );")
	if err != nil {
		elog.Logger.Errorf("create table [storage] failed: %s", err)
	}
	_, err = db.Exec("CREATE UNIQUE INDEX index_name ON storage ( name ASC );")
	if err != nil {
		elog.Logger.Errorf("create INDEX [index_name] failed: %s", err)
	}

	setDatabaseVer()
}

func CloseDatabase() (err error) {
	if db == nil {
		return
	}

	err = db.Close()
	debug.FreeOSMemory()
	runtime.GC()
	return
}

func removeDatabaseFile() (err error) {
	err = os.RemoveAll(util.DBPath)
	if err != nil {
		return
	}
	err = os.RemoveAll(util.DBPath + "-shm")
	if err != nil {
		return
	}
	err = os.RemoveAll(util.DBPath + "-wal")
	if err != nil {
		return
	}
	return
}

func beginTx() (tx *sql.Tx, err error) {
	if tx, err = db.Begin(); err != nil {
		elog.Logger.Errorf("begin tx failed: %s\n", err)
		if strings.Contains(err.Error(), "database is locked") {
			os.Exit(1)
		}
	}
	return
}

func commitTx(tx *sql.Tx) (err error) {
	if tx == nil {
		elog.Logger.Errorf("tx is nil")
		return errors.New("tx is nil")
	}

	if err = tx.Commit(); err != nil {
		elog.Logger.Errorf("commit tx failed: %s\n", err)
	}
	return
}

func execStmtTx(tx *sql.Tx, stmt string, args ...interface{}) (err error) {
	elog.Logger.Infof("[sql/sqlitelib/execStmtTx] sql: %s args: %+v", stmt, args)

	if _, err = tx.Exec(stmt, args...); err != nil {
		if strings.Contains(err.Error(), "database disk image is malformed") {
			tx.Rollback()
			CloseDatabase()
			elog.Logger.Errorf("database disk image [%s] is malformed, please restart SiYuan kernel to rebuild it", util.DBPath)
		}
		elog.Logger.Errorf("exec database stmt [%s] failed: %s\n  %s", stmt)
		return
	}
	return
}

func prepareExecInsertTx(tx *sql.Tx, stmtSQL string, args []interface{}) (err error) {
	stmt, err := tx.Prepare(stmtSQL)

	if err != nil {
		return
	}

	if _, err = stmt.Exec(args...); err != nil {
		elog.Logger.Errorf("exec database stmt [%s] failed: %s", stmtSQL, err)
		return
	}
	return
}

func queryRow(query string, args ...interface{}) *sql.Row {
	elog.Logger.Infof("[sql/sqlitelib/queryRow] sql: %s args: %+v", query, args)
	query = strings.TrimSpace(query)
	if query == "" {
		elog.Logger.Errorf("statement is empty")
		return nil
	}
	return db.QueryRow(query, args...)
}

func query(query string, args ...interface{}) (*sql.Rows, error) {
	elog.Logger.Infof("[sql/sqlitelib/query] sql: %s args: %+v", query, args)
	query = strings.TrimSpace(query)
	if query == "" {
		return nil, errors.New("statement is empty")
	}
	return db.Query(query, args...)
}
