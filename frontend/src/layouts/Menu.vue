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
      <a-layout-content>
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
  console.log('watch menu id ', newValue);
  // 切换 appSider 时，重置 current
  current.value = "menu_100"
  menuHandle();
});

onMounted(() => {
  menuHandle();
});

function menuHandle() {
  console.log('handle menu id:', props.id);
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
    background-color: #FAFAFA;
    overflow: auto;
  }
}
</style>
