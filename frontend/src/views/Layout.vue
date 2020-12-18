<template>
  <a-layout id="components-layout-demo-responsive">
    <a-layout-sider
      v-model="collapsed"
      theme="dark"
    >
      <div class="logo"></div>
      <a-menu class="menu-item" theme="dark" mode="inline" @click="menuHandle" :default-selected-keys="['menu_1']">
        <a-menu-item :key="index" v-for="(menuInfo, index) in menu" :title="menuInfo.title">
          <a-icon :type="menuInfo.icon" />
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-sider
        theme="light"
        style="background-color: #FAFAFA;"
      >
        <a-menu class="sub-menu-item" theme="light" mode="inline" v-model="subMenuKey" :default-selected-keys="subMenuKey">
          <a-menu-item :key="subIndex" v-for="(menuInfo, subIndex) in subMenu">
            <router-link :to="{ path: menuInfo.page }">
              <span>{{ menuInfo.title }}</span>
            </router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout-content :style="{}">
        <div :style="{ padding: '24px', background: '#fff', minHeight: '560px' }">
          <router-view />
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
      menu: {
        'menu_1' : {
          icon: 'home',
          title: ''
        },
        'menu_2' : {
          icon: 'setting',
          title: ''
        },
      },
      menuKey: 'menu_1',
      subMenuKey: ['subMenu_1'],
      subMenu: {},
      subMenuList: {
        'menu_1' : {
          'subMenu_1' : {
            title: '首页菜单1',
            page: '/testa'
          },
          'subMenu_2' : {
            title: '首页菜单2',
            page: '/testb'
          },
        },
        'menu_2' : {
          'subMenu_1' : {
            title: '设置菜单1',
            page: '/testc/testc'
          },
          'subMenu_2' : {
            title: '设置菜单2',
            page: '/testd'
          },
        },
      },
      contentPage: ''
    };
  },
  mounted () {
    this.menuHandle({key: 'menu_1'})
  },
  methods: {
    menuHandle (item) {
      this.subMenu = this.subMenuList[item.key]
      this.subMenuKey = ['subMenu_1']
      const linkPage = this.subMenu['subMenu_1']['page']
      this.$router.push(linkPage)
    },
  },
};
</script>

<style lang="less" scoped>
// 嵌套
#components-layout-demo-responsive {
  .logo {
    height: 32px;
    background: rgba(139, 137, 137, 0.2);
    margin: 16px;
  }  
  .menu-item {
    .ant-menu-item {
      background-color: #001529;
      margin-top: 0px;
      margin-bottom: 0px;
    }
  }
  .sub-menu-item {
    .ant-menu-item {
      margin-top: 0px;
      margin-bottom: 0px;
    }
    .ant-menu-item::after {
      border-right: 3px solid #F2F2F2;
    }
    .ant-menu-item-selected {
      background-color:#F2F2F2;
      span {
        color: #111;
      }
    }
  }
  .sub-menu-item.ant-menu {
    background: #FAFAFA;
  }
  .sub-menu-item.ant-menu-inline {
    border-right: 0px solid #FAFAFA;
  }
}

// #components-layout-demo-responsive .logo {
//   height: 32px;
//   background: rgba(139, 137, 137, 0.2);
//   margin: 16px;
// }
// #components-layout-demo-responsive .menu-item .ant-menu-item {
//   background-color: #001529;
//   margin-top: 0px;
//   margin-bottom: 0px;
// }
// #components-layout-demo-responsive .sub-menu-item .ant-menu-item {
//   margin-top: 0px;
//   margin-bottom: 0px;
// }
// #components-layout-demo-responsive .sub-menu-item .ant-menu-item::after {
//   border-right: 3px solid #F2F2F2;
// }
// #components-layout-demo-responsive .sub-menu-item.ant-menu {
//   background: #FAFAFA;
// }
// #components-layout-demo-responsive .sub-menu-item.ant-menu-inline {
//   border-right: 0px solid #FAFAFA;
// }
// #components-layout-demo-responsive .sub-menu-item .ant-menu-item-selected {
//   background-color:#F2F2F2;
//   span {
//     color: #111;
//   }
// }
</style>
