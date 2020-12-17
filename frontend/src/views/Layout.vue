<template>
  <a-layout id="components-layout-demo-responsive">
    <a-layout-sider
      v-model="collapsed"
      theme="dark"
    >
      <div class="logo"></div>
      <a-menu theme="dark" mode="inline" :default-selected-keys="['1']">
        <a-menu-item class="menu-item" key="1">
          <a-icon type="home" />
        </a-menu-item>
        <a-menu-item class="menu-item" key="2">
          <a-icon type="appstore" />
        </a-menu-item>
        <a-menu-item class="menu-item" key="3">
          <a-icon type="setting" />
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-sider
        theme="light"
      >
        <a-menu theme="light" mode="inline" :default-selected-keys="['1']">
          <a-menu-item key="1">
            <span class="nav-text">nav 1</span>
          </a-menu-item>
          <a-menu-item key="2">
            <span class="nav-text">nav 2</span>
          </a-menu-item>
          <a-menu-item key="3">
            <span class="nav-text">nav 3</span>
          </a-menu-item>
          <a-menu-item key="4">
            <span class="nav-text">nav 4</span>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content :style="{ margin: '24px 16px 0' }">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '360px' }">
          content
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
export default {
  name: 'Layout',
  data() {
    return {
      collapsed: true,
    };
  },
  methods: {
  },
};
</script>

<style lang="less" scoped>
#components-layout-demo-responsive .logo {
  height: 32px;
  background: rgba(139, 137, 137, 0.2);
  margin: 16px;
}
#components-layout-demo-responsive .menu-item {
  background-color: #001529;
}

// /deep/ .ant-menu-item a {
//   color:rgba(255, 255, 255, 0.15);
// }
</style>
