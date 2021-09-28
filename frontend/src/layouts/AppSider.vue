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
      <a-menu class="menu-item" theme="light" mode="inline" :default-selected-keys="['menu_1']" @click="menuHandle">
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
      menu: {
        'menu_1' : {
          icon: 'home',
          title: '功能',
          pageName: 'DemoFileOpenDir',
          params: {},
        },
        'menu_2' : {
          icon: 'profile',
          title: '其它',
          pageName: 'OtherIndex',
          params: {},
        }
      }
    };
  },
  created () {
    console.log('AppSider created:');
    //this.menuHandle({key: 'menu_1'})
  },
  mounted () {
    console.log('AppSider mounted:');
    this.menuHandle({key: 'menu_1'})
  },
  methods: {
    menuHandle (item) {
      console.log('AppSider methods:');
      const linkInfo = this.menu[item.key]
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
