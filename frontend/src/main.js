// import 'normalize.css'; // 样式重置各浏览器统一
import { createApp } from 'vue';
import App from './App.vue';
import Router from './router/index';
// import './styles/nprogress.less'
import * as AntIcon from '@ant-design/icons-vue';
import Antd from 'ant-design-vue';
import './assets/global.less';
import './assets/theme.less';
import { ipc } from './utils/ipcRenderer';

const app = createApp(App)
app.config.productionTip = false

// 注册全部图标
for (const i in AntIcon) {
  const whiteList = ['createFromIconfontCN', 'getTwoToneColor', 'setTwoToneColor', 'default']
  if (!whiteList.includes(i)) {
    app.component(i, AntIcon[i])
  }
}

// 全局注入IPC通信
// Vue.prototype.$ipc = ipc
app.config.globalProperties.$ipc = ipc

app.use(Antd).use(Router).mount('#app')
