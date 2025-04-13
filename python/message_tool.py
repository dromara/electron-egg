from DrissionPage import Chromium, ChromiumOptions
import time

def 私信工具(sec_uid, 发送内容, 延迟, 显示浏览器=True):
    try:
        # 设置浏览器选项
        co = ChromiumOptions()
        if not 显示浏览器:
            co.headless()  # 设置无头模式
            
        # 连接浏览器
        browser = Chromium(co)  
        # 获取标签页对象
        tab = browser.latest_tab  
        # 访问网页
        tab.get(f'https://www.douyin.com/user/{sec_uid}')
        
        # 等待页面加载
        time.sleep(3)
        
        # 查找所有私信元素
        所有私信元素 = tab.eles('xpath://*[text()="私信" and contains(@class, "semi-button-content")]', timeout=10)
        print(f"找到 {len(所有私信元素)} 个私信元素")
        print(所有私信元素)

        # 精准定位私信按钮（索引2）
        if len(所有私信元素) >= 2:
            私信按钮 = 所有私信元素[1]
            
            # 确保元素可见
            tab.scroll.to_see(私信按钮)
            time.sleep(1)
            
            # 获取坐标并点击
            if 私信按钮.rect:
                x, y = 私信按钮.rect.midpoint
                print(f"私信按钮坐标: ({x}, {y})")
            
                browser.wait(延迟)
                # tab.run_js('arguments[0].click()', 私信按钮)
                私信按钮.click()
                print("已尝试点击私信按钮")
                
                # 等待输入框出现
                输入框 = tab.ele('tx=发送消息', timeout=5)
                if not 输入框:
                    raise Exception("未找到消息输入框")
                    
                输入框.input(发送内容)
                tab.wait(1)
                # 等待发送按钮出现
                发送按钮 = tab.ele('.sCp7KhBv EWT1TDgs e2e-send-msg-btn', timeout=5)
                if not 发送按钮:
                    raise Exception("未找到发送按钮")
                    
                发送按钮.click()
                print("信息发送成功")
                tab.wait(3)
                browser.quit()  # 确保浏览器关闭
            else:
                raise Exception("私信按钮没有有效坐标")
        else:
            raise Exception("未找到足够的私信元素")
            
    except Exception as e:
        print(f"发生错误: {str(e)}")
        # 确保浏览器被关闭
        try:
            browser.quit()
        except:
            pass
        # 重新抛出异常，以便调用者知道发送失败
        raise e
