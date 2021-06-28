// 导入组件，组件必须声明 name
import myComponent from './index.vue'

// 为组件提供 install 安装方法，供按需引入
myComponent.install = function (Vue) {
  Vue.component(myComponent.name, myComponent)
}

// 默认导出组件
export default myComponent
