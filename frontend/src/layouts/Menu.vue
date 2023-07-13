<template>
  <a-layout id="app-menu">
    <a-layout-sider
      theme="light"
      class="layout-sider"
    >
      <a-menu 
        theme="light" 
        mode="inline" 
        :selectedKeys="state.selectedKeys"
        @click="handleClick">
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
import { reactive } from 'vue';
// :default-selected-keys="[default_key]" 
import subMenu from '@/config/subMenu';

export default {
  setup() {
    const state = reactive({
      selectedKeys: ['menu_100'],
    });
    
    const handleClick = e => {
      state.selectedKeys = [e.key];
    };

    return {
      state,
      handleClick,
    };
  },
  props: {
    id: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      menu:{},
      current: 'menu_100',
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
      // 该组件优先被加载了，所以没拿到参数
      //console.log('params:', this.$route);
    
      console.log('menu ------ id:', this.id);
      this.menu = subMenu[this.id];
      const linkInfo = this.menu[this.current];
      this.$router.push({ name: linkInfo.pageName, params: linkInfo.params});
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
