<template>
  <a-layout id="app-menu">
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
          pageName: 'BaseFileIndex',
          params: {}
        },
        'menu_300' : {
          icon: 'profile',
          title: '通信',
          pageName: 'BaseSocketIndex',
          params: {}
        },
        'menu_301' : {
          icon: 'profile',
          title: '数据库',
          pageName: 'BaseDBIndex',
          params: {}
        },
        'menu_400' : {
          icon: 'profile',
          title: '视图',
          pageName: 'BaseWindowViewIndex',
          params: {}
        },
        'menu_401' : {
          icon: 'profile',
          title: '窗口',
          pageName: 'BaseWindowIndex',
          params: {}
        },
        'menu_403' : {
          icon: 'profile',
          title: '扩展程序',
          pageName: 'BaseExtensionIndex',
          params: {}
        },
        'menu_405' : {
          icon: 'profile',
          title: '桌面通知',
          pageName: 'BaseNotificationIndex',
          params: {}
        },
        'menu_407' : {
          icon: 'profile',
          title: '电源监控',
          pageName: 'BasePowerMonitorIndex',
          params: {}
        },
        'menu_409' : {
          icon: 'profile',
          title: '屏幕信息',
          pageName: 'BaseScreenIndex',
          params: {}
        },
        'menu_411' : {
          icon: 'profile',
          title: '系统主题',
          pageName: 'BaseThemeIndex',
          params: {}
        },   
        'menu_412' : {
          icon: 'profile',
          title: '自动更新',
          pageName: 'BaseUpdaterIndex',
          params: {}
        },    
        'menu_500' : {
          icon: 'profile',
          title: '软件调用',
          pageName: 'BaseSoftwareIndex',
          params: {}
        },
        'menu_900' : {
          icon: 'profile',
          title: '测试',
          pageName: 'BaseTestApiIndex',
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
#app-menu {
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
