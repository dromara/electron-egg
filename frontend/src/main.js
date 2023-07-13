// import 'normalize.css'; // 样式重置各浏览器统一
import { createApp } from 'vue';
import App from './App.vue';
import Router from './router/index';
// import './styles/nprogress.less'
// import './styles/global.less' // 全局样式
import * as AntIcon from '@ant-design/icons-vue'; // 全局图标
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less'; // 引入官方提供的 less 样式入口文件
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
