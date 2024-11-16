<<<<<<< HEAD
import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.less';
=======
import * as AntIcon from '@ant-design/icons-vue';
import Antd from 'ant-design-vue';
import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.less';
import './assets/theme.less';
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
import components from './components/global';
import Router from './router/index';

const app = createApp(App)
app.config.productionTip = false

// components
for (const i in components) {
  app.component(i, components[i])
}

<<<<<<< HEAD
app.use(Router).mount('#app')
=======
// icon
for (const i in AntIcon) {
  const whiteList = ['createFromIconfontCN', 'getTwoToneColor', 'setTwoToneColor', 'default']
  if (!whiteList.includes(i)) {
    app.component(i, AntIcon[i])
  }
}

app.use(Antd).use(Router).mount('#app')
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
