import Vue from 'vue';
import antd from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';
import App from './App';

Vue.use(antd);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App),
}).$mount('#app');