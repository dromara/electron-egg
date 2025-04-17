'use strict';

// 导入必要的模块
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 定义直播间ID
const ROOM_ID = '66652063317';

// 定义用户数据目录
const userDataDir = path.join(__dirname, 'browser-data');

// 确保用户数据目录存在
if (!fs.existsSync(userDataDir)) {
  fs.mkdirSync(userDataDir, { recursive: true });
  console.log(`创建浏览器数据目录: ${userDataDir}`);
}

// 测试连接和发送消息
async function testLiveChat() {
  console.log(`开始测试连接到直播间: ${ROOM_ID}`);
  console.log(`使用持久化浏览器数据目录: ${userDataDir}`);
  
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    // 启动有持久会话的浏览器
    console.log('正在启动浏览器...');
    browser = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: ['--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox', '--no-sandbox']
    });
    
    // 获取或创建页面
    if (browser.pages().length > 0) {
      page = browser.pages()[0];
    } else {
      page = await browser.newPage();
    }
    
    // 设置视口大小
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // 访问直播间
    console.log('正在连接直播间...');
    const liveUrl = `https://live.douyin.com/${ROOM_ID}`;
    await page.goto(liveUrl, { timeout: 60000 });
    
    // 设置查找标志
    let inputBoxFound = false;
    
    // 同时异步查找播放按钮和输入框
    console.log('同时查找播放按钮和输入框...');
    const textareaSelector = 'textarea.webcast-chatroom___textarea';
    
    // 创建查找输入框的Promise
    const findInputBox = (async () => {
      try {
        await page.waitForSelector(textareaSelector, { timeout: 30000 });
        console.log('成功找到评论输入框 (textarea)');
        inputBoxFound = true;
        return true;
      } catch (e) {
        console.error(`等待评论输入框超时: ${e.message}`);
        return false;
      }
    })();
    
    // 创建查找播放按钮的Promise
    const findPlayButton = (async () => {
      try {
        // 设置标志，控制是否继续查找和点击播放按钮
        let shouldContinue = true;
        
        // 检查输入框是否已找到
        const checkInputBox = () => {
          if (inputBoxFound) {
            console.log('输入框已找到，停止查找播放按钮');
            shouldContinue = false;
          }
          return inputBoxFound;
        };
        
        // 最多尝试5次，或者直到找到输入框
        for (let i = 0; i < 5 && shouldContinue; i++) {
          // 每次循环前检查输入框是否已找到
          if (checkInputBox()) break;
          
          console.log(`尝试查找播放按钮 (${i+1}/5)...`);
          // 尝试查找播放按钮
          const playButton = await page.$(`.xgplayer-icon`);
          
          // 再次检查输入框是否已找到
          if (checkInputBox()) break;
          
          if (playButton) {
            console.log('找到播放按钮，尝试点击...');
            // 设置较短的超时时间，避免长时间等待
            try {
              await Promise.race([
                playButton.click(),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('点击超时，可能已找到输入框')), 3000)
                )
              ]);
              console.log('已点击播放按钮');
            } catch (error) {
              console.log(`点击操作中断: ${error.message}`);
            }
          } else {
            console.log('未找到播放按钮');
          }
          
          // 等待一段时间后再尝试
          await page.waitForTimeout(1000);
          
          // 再次检查输入框是否已找到
          if (checkInputBox()) break;
        }
      } catch (e) {
        console.log('查找播放按钮过程中出错:', e.message);
      }
    })();
    
    // 等待两个Promise都完成
    await Promise.all([findInputBox, findPlayButton]);
    
    // 如果没找到输入框，退出
    if (!inputBoxFound) {
      console.error('未能找到评论输入框，无法继续测试');
      await browser.close();
      process.exit(1);
    }
    
    // 检查是否成功进入直播间
    const title = await page.title();
    console.log(`直播间标题: ${title}`);
    
    // 询问用户是否发送消息
    rl.question('已连接直播间，按回车键发送"你好"消息...', async () => {
      // 发送测试消息
      console.log('正在发送消息...');
      
      try {
        // 先点击输入框获取焦点
        console.log('点击输入框获取焦点...');
        await page.click(textareaSelector);
        
        // 等待一小段时间确保焦点已获取
        await page.waitForTimeout(500);
        
        // 清空输入框
        await page.evaluate((selector) => {
          document.querySelector(selector).value = '';
        }, textareaSelector);
        
        // 直接使用keyboard.type输入内容
        await page.keyboard.type('你好');
        console.log('已输入消息内容');
        
        // 等待一小段时间后按回车发送
        await page.waitForTimeout(500);
        await page.keyboard.press('Enter');
        console.log('已按回车发送消息');
      } catch (error) {
        console.error('发送消息时出错:', error);
      }
      
      // 询问是否关闭浏览器
      rl.question('消息已发送，按回车键关闭浏览器(数据将被保存)...', async () => {
        // 关闭浏览器
        console.log('正在关闭浏览器...');
        await browser.close();
        console.log('浏览器已关闭，但登录信息和Cookies已保存');
        
        // 结束测试
        rl.close();
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('测试过程中出错:', error);
    
    // 确保关闭浏览器
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('关闭浏览器时出错:', e);
      }
    }
    
    process.exit(1);
  }
}

// 运行测试
testLiveChat(); 