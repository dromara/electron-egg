import * as AntIcon from '@ant-design/icons-vue';
import Antd from 'ant-design-vue';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.less';
import './assets/theme.less';
import components from './components/global';
import Router from './router/index';

const app = createApp(App)

// components
type ComponentsType = typeof components;
for (const componentName in components) {
  if (Object.prototype.hasOwnProperty.call(components, componentName)) {
    const component = components[componentName as keyof ComponentsType];
    app.component(componentName, component);
  }
}

// icon
const whiteList = ['createFromIconfontCN', 'getTwoToneColor', 'setTwoToneColor', 'default']
const iconKeys = Object.keys(AntIcon) as Array<keyof typeof AntIcon>;
iconKeys.forEach(key => {
  if (!whiteList.includes(key as typeof whiteList[number])) {
    app.component(key.toString(), AntIcon[key]);
  }
});

app.use(Antd).use(Router).mount('#app')
