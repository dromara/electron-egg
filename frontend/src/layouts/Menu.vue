<template>
  <a-layout id="app-menu">
    <a-layout-sider
      theme="light"
      class="layout-sider"
    >
      <a-menu
        theme="light"
        mode="inline"
        :selectedKeys="[current]"
        @click="changeMenu">
        <a-menu-item v-for="(menuInfo, subIndex) in menu" :key="subIndex">
          <router-link :to="{ name: menuInfo.pageName, params: menuInfo.params}">
            <span>{{ menuInfo.title }}</span>
          </router-link>
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
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import subMenu from '@/router/subMenu';

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
});

const router = useRouter();
const current = ref('menu_100');
const menu = ref({});

watch(() => props.id, (newValue) => {
  current.value = "menu_100"
  menuHandle();
});

onMounted(() => {
  menuHandle();
});

function menuHandle() {
  menu.value = subMenu[props.id];
  const linkInfo = menu.value[current.value];
  router.push({ name: linkInfo.pageName, params: linkInfo.params });
}

function changeMenu(e) {
  current.value = e.key;
}
</script>
<style lang="less" scoped>
#app-menu {
  height: 100%;
  text-align: center;

  .layout-sider {
    border-top: 1px solid #e8e8e8;
    border-right: 1px solid #e8e8e8;
    background-color: #fafafa !important;
    overflow: auto;
    height: 100%;

    .ant-menu-item {
      border-radius: 8px;
      margin: 4px 8px;
      padding: 0 16px !important;
      transition: all 0.3s ease;

      &:hover {
        background-color: #e6f7ff !important;
      }

      &.ant-menu-item-selected {
        background-color: rgba(7, 193, 96, 0.08) !important;
      }

      a {
        color: #666666;
        text-decoration: none;
        transition: color 0.3s ease;

        &:hover {
          color: #2c3e50;
        }
      }
    }

    .ant-menu-item-selected a {
      color: #07C160 !important;
    }
  }

  .layout-content {
    background-color: #f0f2f5;
    height: 100%;
    overflow: hidden;
  }
}
</style>