import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.less';
// 移除 Ant Design 主题
// import './assets/theme.less';
import components from './components/global';
import Router from './router/index';
import ElementIcons from './plugins/icons';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App)
app.config.productionTip = false

// 注册全局组件
for (const i in components) {
  app.component(i, components[i])
}

// 注册Element Plus图标
app.use(ElementIcons)
// 注册Pinia
app.use(pinia)
// 注册路由
app.use(Router)

app.mount('#app')
