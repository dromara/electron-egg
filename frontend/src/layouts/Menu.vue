<template>
  <a-layout id="app-menu">
    <a-layout-sider
      theme="light"
      class="layout-sider"
    >
      <a-menu theme="light" mode="inline" :default-selected-keys="[default_key]" :selected-keys="[current]" @click="menuClick">
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
import subMenu from '@/config/subMenu'

export default {
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      menu:{},
      default_key: 'menu_100',
      current: '',
      keys: []
    };
  },
  watch: {
    id: function () {
      this.menuHandle();
    },
  },
  created () {
  },
  mounted () {
    this.menuHandle();
  },
  methods: {
    menuHandle () {
      this.current = this.default_key;
      this.menu = subMenu[this.id];
      // switch (this.id) {
      //   case 'base' :
      //     this.menu = subMenu.base;
      //     break;
      //   case 'other' :
      //     this.menu = subMenu.other;
      //     break;                                    
      // }
      const linkInfo = this.menu[this.current];
      this.$router.push({ name: linkInfo.pageName, params: linkInfo.params});
    },
    menuClick(e) {
      this.current = e.key;
    },
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
