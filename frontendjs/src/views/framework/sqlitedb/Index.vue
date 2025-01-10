<template>
  <div id="app-sqlite-db">
    <div class="one-block-1">
      <span>
        1. sqlite本地数据库
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="8">
          • 大数据量: 0-1024GB(单库)
        </a-col>
        <a-col :span="8">
          • 高性能
        </a-col>
        <a-col :span="8">
          • 类mysql语法
        </a-col>
      </a-row>
    </div>
    <div class="one-block-1">
      <span>
        2. 数据目录
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="12">
          <a-input v-model="data_dir" :value="data_dir" addon-before="数据目录" />
        </a-col>
        <a-col :span="2">
        </a-col>
        <a-col :span="5">
          <a-button @click="selectDir()">
            修改目录
          </a-button>
        </a-col>
        <a-col :span="5">
          <a-button @click="openDir()">
            打开目录
          </a-button>
        </a-col>        
      </a-row>
    </div>     
    <div class="one-block-1">
      <span>
        3. 测试数据
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="24">
          {{ all_list }}
        </a-col>
      </a-row>
    </div>    
    <div class="one-block-1">
      <span>
        4. 添加数据
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="6">
          <a-input v-model="name" :value="name" addon-before="姓名" />
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
          <a-input v-model="age" :value="age" addon-before="年龄" />
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
          <a-button @click="sqlitedbOperation('add')">
            添加
          </a-button>
        </a-col>
      </a-row>
    </div>
    <div class="one-block-1">
      <span>
        4. 获取数据
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <a-input v-model:value="search_age" addon-before="年龄" />
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
          <a-button @click="sqlitedbOperation('get')">
            查找
          </a-button>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24">
          {{ userList }}
        </a-col>
      </a-row>
    </div>
    <div class="one-block-1">
      <span>
        5. 修改数据
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <a-input v-model:value="update_name" addon-before="姓名(条件)" />
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <a-input v-model:value="update_age" addon-before="年龄" />
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
          <a-button @click="sqlitedbOperation('update')">
            更新
          </a-button>
        </a-col>
      </a-row>
    </div>
    <div class="one-block-1">
      <span>
        6. 删除数据
      </span>
    </div>  
    <div class="one-block-2">
      <a-row>
        <a-col :span="6">
          <!-- eslint-disable-next-line vue/no-v-model-argument -->
          <a-input v-model:value="delete_name" addon-before="姓名" />
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
        </a-col>
        <a-col :span="3">
        </a-col>
        <a-col :span="6">
          <a-button @click="sqlitedbOperation('del')">
            删除
          </a-button>
        </a-col>
      </a-row>
    </div>       
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';

const name = ref('李四');
const age = ref(20);
const userList = ref(['空']);
const search_age = ref(20);
const update_name = ref('李四');
const update_age = ref(31);
const delete_name = ref('李四');
const all_list = ref(['空']);
const data_dir = ref('');

onMounted(() => {
  init()
})

function init() {
  const params = {
    action: 'getDataDir',
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
    if (res.code == -1) {
      message.error('请检查sqlite是否正确安装', 5);
      return
    }

    data_dir.value = res.result;
    getAllTestData();
  }) 
}

function getAllTestData () {
  const params = {
    action: 'all',
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
    if (res.all_list.length == 0) {
      return false;
    }
    all_list.value = res.all_list;
  }) 
}

function selectDir() {
  ipc.invoke(ipcApiRoute.os.selectFolder, '').then(r => {
    data_dir.value = r;
    // 修改数据目录
    modifyDataDir(r);
  })
}

function openDir() {
  console.log('data_dir:', data_dir.value);
  ipc.invoke(ipcApiRoute.os.openDirectory, {id: data_dir.value})
}

function modifyDataDir(dir) {
  const params = {
    action: 'setDataDir',
    data_dir: dir
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
    all_list.value = res.all_list;
  }) 
}

function sqlitedbOperation (ac) {
  const params = {
    action: ac,
    info: {
      name: name.value,
      age: parseInt(age.value)
    },
    search_age: parseInt(search_age.value),
    update_name: update_name.value,
    update_age: parseInt(update_age.value),
    delete_name: delete_name.value,
  }
  if (ac == 'add' && name.value.length == 0) {
    message.error(`请填写数据`);
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
    console.log('res:', res);
    if (ac == 'get') {
      if (res.result.length == 0) {
        message.error(`没有数据`);
        return;
      }
      userList.value = res.result;
    }
    if (res.all_list.length == 0) {
      all_list.value = ['空'];
      return;
    }
    all_list.value = res.all_list;
    message.success(`success`);
  }) 
}
</script>
<style lang="less" scoped>
#app-sqlite-db {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
