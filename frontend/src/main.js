import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.less';
// 移除 Ant Design 主题
// import './assets/theme.less';
import components from './components/global';
import Router from './router/index';
import ElementIcons from './plugins/icons';

const app = createApp(App)
app.config.productionTip = false

// 注册全局组件
for (const i in components) {
  app.component(i, components[i])
}

// 注册Element Plus图标
app.use(ElementIcons)

// Element Plus已通过unplugin-vue-components自动导入，无需在此处导入

app.use(Router).mount('#app')
