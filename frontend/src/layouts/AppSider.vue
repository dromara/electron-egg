<template>
  <a-layout id="app-layout-sider">
    <a-layout-sider
      v-model="collapsed"
      theme="light"
      class="layout-sider"
    >
      <div class="logo">
        <img class="pic-logo" src="~@/assets/logo.png">
      </div>
      <a-menu class="menu-item" theme="light" mode="inline" :default-selected-keys="[default_key]" @click="menuHandle">
        <a-menu-item v-for="(menuInfo, index) in menu" :key="index">
          <a-icon :type="menuInfo.icon" />
          {{ menuInfo.title }}
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-content class="layout-content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  name: 'AppSider',
  data() {
    return {
      collapsed: true,
      default_key: 'menu_1',
      current: '',
      menu: {
        'menu_1' : {
          icon: 'home',
          title: '框架',
          pageName: 'Base',
          params: {},
        },
        'menu_2' : {
          icon: 'desktop',
          title: '其它',
          pageName: 'Other',
          params: {},
        },              
      }
    };
  },
  created () {
    //console.log('[sider] [created] 1');
  },
  mounted () {
    //console.log('[sider] [mounted] 2');
    this.menuHandle()
  },
  methods: {
    menuHandle (e) {
      this.current = e ? e.key : this.default_key;
      //console.log('[sider] [methods] 3');
      //console.log('[sider] [methods] current', this.current);
      const linkInfo = this.menu[this.current]
      console.log('[home] load page:', linkInfo.pageName);
      this.$router.push({ name: linkInfo.pageName, params: linkInfo.params})
    },
  },
};
</script>
<style lang="less" scoped>
// 嵌套
#app-layout-sider {
  height: 100%;
  .logo {
    border-bottom: 1px solid #e8e8e8;
  }
  .pic-logo {
    height: 32px;
    //background: rgba(139, 137, 137, 0.2);
    margin: 10px;
  }
  .layout-sider {
    border-top: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
  }
  .menu-item {
    .ant-menu-item {
      background-color: #fff;
      margin-top: 0px;
      margin-bottom: 0px;
      padding: 0 0px !important;
    }
  }
  .layout-content {
    //background-color: #fff;
  }
}
</style>
