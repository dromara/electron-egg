<template>
  <el-container id="app-layout-sider">
    <el-aside 
      class="layout-sider"
      width="200px"
    >
      <el-menu
        class="el-menu-vertical-demo custom-menu"
        :default-active="activeMenuItem"
        @open="handleOpen"
        @close="handleClose"
        @select="handleSelect"
        background-color="transparent"
        text-color="#303133"
        active-text-color="#ffffff"
      >
        <template v-for="(menuInfo, index) in menu" :key="index">
          <!-- 有子菜单的项 -->
          <el-sub-menu 
            v-if="hasSubMenu(menuInfo.pageName)"
            :index="index" 
          >
            <template #title>
              <el-icon>
                <component :is="getIcon(menuInfo.icon)" />
              </el-icon>
              <span>{{ menuInfo.title }}</span>
            </template>
            
            <el-menu-item 
              v-for="(subItem, subKey) in getSubMenuItems(menuInfo.pageName)" 
              :index="`${index}-${subKey}`" 
              :key="`${index}-${subKey}`"
            >
              <span>{{ subItem.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          
          <!-- 没有子菜单的项 -->
          <el-menu-item 
            v-else
            :index="index"
          >
            <el-icon>
              <component :is="getIcon(menuInfo.icon)" />
            </el-icon>
            <span>{{ menuInfo.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main class="layout-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import { ref, onMounted, markRaw } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import subMenu from '@/router/subMenu';
import { 
  Monitor,
  Setting, 
  PieChart, 
  Connection, 
  VideoCamera
} from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 预先注册图标组件以避免动态渲染问题
const icons = {
  Monitor: markRaw(Monitor),
  Setting: markRaw(Setting),
  PieChart: markRaw(PieChart),
  Connection: markRaw(Connection),
  VideoCamera: markRaw(VideoCamera)
};

const current = ref('menu_1');
const activeMenuItem = ref('');

const menu = ref({
  'menu_1': {
    icon: 'Monitor',
    title: '框架',
    pageName: 'Framework',
    params: {}
  },
  'menu_2': {
    icon: 'Setting',
    title: '系统',
    pageName: 'Os',
    params: {}
  },
  'menu_3': {
    icon: 'PieChart',
    title: '特效',
    pageName: 'Effect',
    params: {}
  },
  'menu_4': {
    icon: 'Connection',
    title: 'cross',
    pageName: 'Cross',
    params: {}
  },
  'menu_5': {
    icon: 'VideoCamera',
    title: '直播录制',
    pageName: 'Live_save',
    params: {}
  }
});

// 获取图标组件
function getIcon(name) {
  return icons[name] || null;
}

// 检查是否有子菜单
function hasSubMenu(pageName) {
  const lowerCaseName = pageName?.toLowerCase();
  return subMenu[lowerCaseName] && Object.keys(subMenu[lowerCaseName]).length > 0;
}

// 获取子菜单项
function getSubMenuItems(pageName) {
  const lowerCaseName = pageName?.toLowerCase();
  if (subMenu[lowerCaseName]) {
    return subMenu[lowerCaseName];
  }
  return {};
}

function handleOpen(key, keyPath) {
  console.log('open', key, keyPath);
}

function handleClose(key, keyPath) {
  console.log('close', key, keyPath);
}

function handleSelect(key) {
  console.log('select', key);
  activeMenuItem.value = key;
  
  if (key.includes('-')) {
    // 子菜单项被选中
    const [mainIndex, subKey] = key.split('-');
    const mainMenu = menu.value[mainIndex];
    if (!mainMenu) return;
    
    const subMenuItem = getSubMenuItems(mainMenu.pageName)[subKey];
    
    if (subMenuItem) {
      router.push({ name: subMenuItem.pageName, params: subMenuItem.params });
    }
  } else {
    // 主菜单项被选中
    const mainMenu = menu.value[key];
    if (!mainMenu) return;
    
    if (hasSubMenu(mainMenu.pageName)) {
      // 有子菜单，默认跳转到第一个子菜单
      const subMenuItems = getSubMenuItems(mainMenu.pageName);
      const firstSubKey = Object.keys(subMenuItems)[0];
      
      if (firstSubKey) {
        const firstSubItem = subMenuItems[firstSubKey];
        router.push({ name: firstSubItem.pageName, params: firstSubItem.params });
        // 更新选中项
        activeMenuItem.value = `${key}-${firstSubKey}`;
      }
    } else {
      // 没有子菜单，直接跳转到主菜单对应路由
      router.push({ name: mainMenu.pageName, params: mainMenu.params });
    }
  }
}

// 初始化当前激活的菜单项
function updateActiveMenuItem() {
  const currentRouteName = route.name;
  if (!currentRouteName) return;
  
  // 遍历查找当前路由对应的菜单项
  for (const [mainIndex, mainItem] of Object.entries(menu.value)) {
    if (!mainItem) continue;
    
    if (hasSubMenu(mainItem.pageName)) {
      const subItems = getSubMenuItems(mainItem.pageName);
      
      for (const [subKey, subItem] of Object.entries(subItems)) {
        if (subItem?.pageName === currentRouteName) {
          activeMenuItem.value = `${mainIndex}-${subKey}`;
          current.value = mainIndex;
          return;
        }
      }
    }
    
    // 如果主菜单路由名称匹配
    if (mainItem.pageName === currentRouteName) {
      current.value = mainIndex;
      activeMenuItem.value = mainIndex;
      return;
    }
  }
}

// 隐藏Electron菜单栏
onMounted(() => {
  updateActiveMenuItem();
  
  // 如果没有找到匹配的菜单项，默认选中第一个菜单
  if (!activeMenuItem.value) {
    const firstMainKey = Object.keys(menu.value)[0];
    if (!firstMainKey) return;
    
    const mainMenu = menu.value[firstMainKey];
    
    if (mainMenu) {
      if (hasSubMenu(mainMenu.pageName)) {
        const subMenuItems = getSubMenuItems(mainMenu.pageName);
        const firstSubKey = Object.keys(subMenuItems)[0];
        
        if (firstSubKey) {
          const firstSubItem = subMenuItems[firstSubKey];
          router.push({ name: firstSubItem.pageName, params: firstSubItem.params });
          activeMenuItem.value = `${firstMainKey}-${firstSubKey}`;
        } else {
          router.push({ name: mainMenu.pageName, params: mainMenu.params });
          activeMenuItem.value = firstMainKey;
        }
      } else {
        router.push({ name: mainMenu.pageName, params: mainMenu.params });
        activeMenuItem.value = firstMainKey;
      }
    }
  }
});
</script>
<style lang="less" scoped>
#app-layout-sider {
  height: 100%;
  display: flex;
  overflow: hidden;
  
  .layout-sider {
    border-right: 1px solid #e8e8e8;
    padding-top: 0;
    overflow-y: hidden;
  }
  
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    height: 100vh;
    border-right: none;
    padding: 10px;
    overflow-y: auto;
  }
  
  .layout-content {
    padding: 20px;
    height: 100vh;
    overflow-y: auto;
  }
}

:deep(.el-container) {
  height: 100vh;
  overflow: hidden;
}

:deep(.el-main) {
  padding: 10px 20px 20px;
  overflow-y: auto;
}

/* 自定义菜单样式 */
:deep(.custom-menu) {
  border-right: none;
  background-color: transparent !important;
    
  .el-menu-item {
    height: 40px;
    line-height: 40px;
    margin: 4px 0;
    border-radius: 4px;
    padding: 0 16px !important;
    font-size: 14px;
    background-color: transparent;
    
    &:hover {
      background-color: #eaf4fc;
    }
    
    &.is-active {
      background-color: #1890ff;
      color: #ffffff;
      
      .el-icon {
        color: #ffffff !important;
      }
      
      &::before {
        display: none;
      }
    }
  }
  
  .el-sub-menu {
    .el-sub-menu__title {
      padding-left: 16px !important;
      border-radius: 4px;
      margin: 4px 0;
      height: 40px;
      line-height: 40px;
      
      &:hover {
        background-color: #f0f2f5;
      }
    }
    
    .el-menu {
      padding: 0 !important;
      background-color: transparent;
    }
    
    .el-menu-item {
      min-width: auto;
      padding-left: 40px !important;
      height: 36px;
      line-height: 36px;
      
      &.is-active {
        background-color: #1890ff;
        color: #ffffff;
      }
    }
  }
}
</style>
