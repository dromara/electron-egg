import Vue from 'vue'
import antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import App from './App'
import router from './router'
import { VueAxios } from './utils/request'
import InjectIpc from '@/utils/injectIpc'
import HotKeyInput from '@/utils/shortcut/lib/index.min.js'

Vue.use(antd)
// mount axios to `Vue.$http` and `this.$http`
Vue.use(VueAxios)
// 全局注入IPC
Vue.use(InjectIpc)

Vue.use(HotKeyInput)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
