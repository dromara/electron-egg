<template>
  <a-layout id="app-layout-sider">
    <a-layout-sider
      v-model="collapsed"
      theme="light"
      class="layout-sider"
      width="100"
    >
      <div class="logo">
        <img class="pic-logo" src="~@/assets/logo.png">
      </div>
      <a-menu 
        class="menu-item" 
        theme="light" 
        mode="inline"
        :selectedKeys="[current]"
        @click="menuHandle"
      >
        <a-menu-item v-for="(menuInfo, index) in menu" :key="index">
          <icon-font :type="menuInfo.icon" />
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
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 定义菜单项的类型
interface MenuItem {
  icon: string;
  title: string;
  pageName: string;
  params: Record<string, any>;
}

// 定义菜单的类型
interface Menu {
  [key: string]: MenuItem;
}

const router = useRouter();

const collapsed = ref<boolean>(true);
const current = ref<string>('menu_1');
const menu = ref<Menu>({
  'menu_1': {
    icon: 'icon-fengche',
    title: '框架',
    pageName: 'Framework',
    params: {}
  },
  'menu_2': {
    icon: 'icon-niudan',
    title: '系统',
    pageName: 'Os',
    params: {}
  },
  'menu_3': {
    icon: 'icon-liuxing',
    title: '特效',
    pageName: 'Effect',
    params: {}
  },
  'menu_4': {
    icon: 'icon-gouwu',
    title: 'cross',
    pageName: 'Cross',
    params: {}
  }
});

onMounted(() => {
  menuHandle(null);
});

function menuHandle(e: any): void {
  console.log('sider menu e:', e);
  if (e) {
    current.value = e.key;
  }
  console.log('sider menu current:', current.value);

  const linkInfo = menu.value[current.value];
  console.log('[home] load linkInfo:', linkInfo);
  router.push({ name: linkInfo.pageName, params: linkInfo.params });
}
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
