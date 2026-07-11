const { app, BrowserWindow, dialog } = require('electron');
console.log('better-sqlite3::===== better-sqlite3 测试开始 =====');

const Database = require('better-sqlite3');

// 创建内存数据库
const db = new Database(':memory:');
console.log('✓ better-sqlite3::数据库创建成功');

// 创建表
db.exec(`
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER
)
`);
console.log('✓ better-sqlite3::表创建成功');

// 插入数据
const insert = db.prepare('INSERT INTO users (name, age) VALUES (?, ?)');
const info = insert.run('张三', 25);
console.log('✓ 插入成功, lastInsertRowid:', info.lastInsertRowid);

insert.run('李四', 30);
insert.run('王五', 28);

// 查询数据
const rows = db.prepare('SELECT * FROM users').all();
console.log('✓ better-sqlite3::查询成功, 记录数:', rows.length);
console.log('better-sqlite3::数据:', rows);

// 关闭数据库
db.close();
console.log('✓ better-sqlite3::数据库关闭成功');

console.log('===== better-sqlite3::所有测试通过! =====');


app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
        }
    })
    mainWindow.loadURL('www.baidu.com')
})
