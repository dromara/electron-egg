<template>
  <a-layout id="app-layout-sider">
    <a-layout-sider
      v-model="collapsed"
      theme="light"
      class="layout-sider"
      width="72"
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
          <!-- <span class="menu-title">{{ menuInfo.title }}</span> -->
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
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const collapsed = ref(true);
const current = ref('menu_1');
const menu = ref({
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
  menuHandle();
});

function menuHandle(e) {
  if (e) {
    current.value = e.key;
  }
  const linkInfo = menu.value[current.value];
  router.push({ name: linkInfo.pageName, params: linkInfo.params });
}
</script>
<style lang="less" scoped>
#app-layout-sider {
  height: 100vh;

  .logo {
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 0;
  }

  .pic-logo {
    height: 36px;
    margin: 0;
  }

  .layout-sider {
    border-top: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
    background-color: #fafafa !important;
    height: 100vh;
  }

  .menu-item {
    .ant-menu-item {
      margin-top: 0;
      margin-bottom: 0;
      padding: 0 12px !important;
      height: 48px;
      line-height: 48px;
      border-radius: 8px;
      margin: 4px 8px;
      transition: all 0.3s ease;

      &:hover {
        background-color: #e6f7ff !important;
      }

      &.ant-menu-item-selected {
        background-color: rgba(7, 193, 96, 0.08) !important;
        color: #07C160 !important;

        .menu-title {
          color: #07C160;
        }
      }
    }
  }

  .layout-content {
    background-color: #f0f2f5;
    height: 100%;
    overflow: hidden;
  }
}
</style>