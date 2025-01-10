import * as AntIcon from '@ant-design/icons-vue';
import Antd from 'ant-design-vue';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.less';
import './assets/theme.less';
import components from './components/global';
import Router from './router/index';

const app = createApp(App)

// Register global components
Object.keys(components).forEach((key) => {
  app.component(key, components[key]);
});

// Register Ant Design Vue icons
Object.keys(AntIcon).forEach((key) => {
  const whiteList = ['createFromIconfontCN', 'getTwoToneColor', 'setTwoToneColor', 'default'];
  if (!whiteList.includes(key)) {
    app.component(key, AntIcon[key]);
  }
});

app.use(Antd).use(Router).mount('#app')
