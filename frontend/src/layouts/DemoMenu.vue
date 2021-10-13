<template>
  <a-layout id="app-demo-menu">
    <a-layout-sider
      theme="light"
      class="layout-sider"
    >
      <a-menu theme="light" mode="inline" :default-selected-keys="['menu_100']">
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
        'menu_100' : {
          icon: 'profile',
          title: '文件',
          pageName: 'DemoFileIndex',
          params: {}
        },
        'menu_300' : {
          icon: 'profile',
          title: '通信',
          pageName: 'DemoSocketIndex',
          params: {}
        },
        'menu_301' : {
          icon: 'profile',
          title: '扩展程序',
          pageName: 'DemoExtendIndex',
          params: {}
        },
        'menu_400' : {
          icon: 'profile',
          title: '视图',
          pageName: 'DemoWindowViewIndex',
          params: {}
        },
        'menu_401' : {
          icon: 'profile',
          title: '窗口',
          pageName: 'DemoWindowIndex',
          params: {}
        },
        'menu_402' : {
          icon: 'profile',
          title: '桌面通知',
          pageName: 'DemoNotificationIndex',
          params: {}
        },
        'menu_403' : {
          icon: 'profile',
          title: '电源监控',
          pageName: 'DemoPowerMonitorIndex',
          params: {}
        },
        'menu_404' : {
          icon: 'profile',
          title: '屏幕信息',
          pageName: 'DemoScreenIndex',
          params: {}
        },
        'menu_405' : {
          icon: 'profile',
          title: '系统主题',
          pageName: 'DemoThemeIndex',
          params: {}
        },       
        'menu_500' : {
          icon: 'profile',
          title: '软件调用',
          pageName: 'DemoSoftwareIndex',
          params: {}
        },
        'menu_600' : {
          icon: 'profile',
          title: '系统',
          pageName: 'DemoSystemIndex',
          params: {}
        },
        'menu_800' : {
          icon: 'profile',
          title: '快捷键',
          pageName: 'DemoShortcutIndex',
          params: {}
        },
        'menu_900' : {
          icon: 'profile',
          title: '测试',
          pageName: 'DemoTestApiIndex',
          params: {}
        }                                                 
      }
    };
  },
  created () {
  },
  mounted () {
    this.menuHandle({key: 'menu_100'})
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
  text-align: center;
  .layout-sider {
    border-top: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
    background-color: #FAFAFA;
    overflow: auto;
  }
}
</style>
