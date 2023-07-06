import antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.less';
import Vue from 'vue';
import App from './App';
import router from './router';
import { ipc } from './utils/ipcRenderer';
import { VueAxios } from './utils/request';

// 使用antd
Vue.use(antd)

// mount axios to `Vue.$http` and `this.$http`
Vue.use(VueAxios)

// 全局注入IPC通信
Vue.prototype.$ipc = ipc

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
