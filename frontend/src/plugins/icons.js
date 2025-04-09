// 引入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export default {
  install(app) {
    // 注册所有图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }
  }
} 