<template>
  <a-layout id="app-demo-menu">
    <a-layout-sider
      theme="light"
      class="layout-sider"
    >
      <a-menu class="sub-menu-item" theme="light" mode="inline" :default-selected-keys="['menu_1']">
        <a-menu-item v-for="(menuInfo, subIndex) in menu" :key="subIndex">
          <router-link :to="{ name: menuInfo.pageName, params: menuInfo.params}">
            <span>{{ menuInfo.title }}</span>
          </router-link>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content>
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  data() {
    return {
      menu: {
        'menu_1' : {
          icon: 'profile',
          title: '文件 - 上传文件',
          pageName: 'DemoFileUploadFile',
          params: {}
        },
        'menu_2' : {
          icon: 'profile',
          title: '文件 - 打开文件夹',
          pageName: 'DemoFileOpenDir',
          params: {}
        },
        'menu_3' : {
          icon: 'profile',
          title: '通信 - IPC',
          pageName: 'DemoSocketIpc',
          params: {}
        },
        'menu_4' : {
          icon: 'profile',
          title: '快捷键 - 注册',
          pageName: 'DemoShortcutIndex',
          params: {}
        },
        'menu_5' : {
          icon: 'profile',
          title: '软件 - 打开第三方软件',
          pageName: 'DemoSoftwareOpen',
          params: {}
        },
        'menu_6' : {
          icon: 'profile',
          title: '系统 - 开机启动',
          pageName: 'DemoSystemAutoLaunch',
          params: {}
        },
      }
    };
  },
  created () {
  },
  mounted () {
    this.menuHandle({key: 'menu_1'})
  },
  methods: {
    menuHandle (item) {
      const linkInfo = this.menu[item.key]
      this.$router.push({ name: linkInfo.pageName, params: linkInfo.params})
    }
  }
};
</script>
<style lang="less" scoped>
#app-demo-menu {
  height: 100%;
  text-align: left;
  .layout-sider {
    border-top: 1px solid #e8e8e8;
    border-right: 0px solid #e8e8e8;
    background-color: #FAFAFA;
  }
}
</style>
