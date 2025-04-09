<template>
  <div id="app-sqlite-db">
    <div class="one-block-1">
      <span>
        1. sqlite本地数据库
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="8">
          • 大数据量: 0-1024GB(单库)
        </el-col>
        <el-col :span="8">
          • 高性能
        </el-col>
        <el-col :span="8">
          • 类mysql语法
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        2. 数据目录
      </span>
    </div>  
    <div class="one-block-2">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-input v-model="data_dir" :value="data_dir">
            <template #prepend>数据目录</template>
          </el-input>
        </el-col>
        <el-col :span="2">
        </el-col>
        <el-col :span="5">
          <el-button @click="selectDir()">
            修改目录
          </el-button>
        </el-col>
        <el-col :span="5">
          <el-button @click="openDir()">
            打开目录
          </el-button>
        </el-col>        
      </el-row>
    </div>     
    <div class="one-block-1">
      <span>
        3. 测试数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row>
        <el-col :span="24">
          {{ all_list }}
        </el-col>
      </el-row>
    </div>    
    <div class="one-block-1">
      <span>
        4. 添加数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="name" :value="name">
            <template #prepend>姓名</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-input v-model="age" :value="age">
            <template #prepend>年龄</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('add')">
            添加
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        4. 获取数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="search_age">
            <template #prepend>年龄</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('get')">
            查找
          </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          {{ userList }}
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        5. 修改数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="update_name">
            <template #prepend>姓名(条件)</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-input v-model="update_age">
            <template #prepend>年龄</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('update')">
            更新
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="one-block-1">
      <span>
        6. 删除数据
      </span>
    </div>  
    <div class="one-block-2">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-input v-model="delete_name">
            <template #prepend>姓名</template>
          </el-input>
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
        </el-col>
        <el-col :span="3">
        </el-col>
        <el-col :span="6">
          <el-button @click="sqlitedbOperation('del')">
            删除
          </el-button>
        </el-col>
      </el-row>
    </div>       
  </div>
</template>
<script setup>
import { ipcApiRoute } from '@/api';
import { ipc } from '@/utils/ipcRenderer';
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';

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
      ElMessage.error('请检查sqlite是否正确安装');
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
    all_list.value = res.result;
  })  
}

function sqlitedbOperation(action) {
  if (action == 'add') {
    const params = {
      action: action,
      name: name.value,
      age: age.value, 
    }

    ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
      ElMessage.success(res);
      getAllTestData();
    })
  } else if (action == 'get') {  
    const params = {
      action: action,
      age: search_age.value, 
    }
    ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
      ElMessage.info("查询完成");
      userList.value = res.result;
    })
  } else if (action == 'del') {  
    const params = {
      action: action,
      name: delete_name.value, 
    }
    ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
      ElMessage.success(res);
      getAllTestData();
    })
  } else if (action == 'update') {  
    const params = {
      action: action,
      name: update_name.value,
      age: update_age.value, 
    }
    ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
      ElMessage.success(res);
      getAllTestData();
    })
  }
}

function selectDir() {
  ipc.invoke(ipcApiRoute.os.selectFolder).then(r => {
    data_dir.value = r;

    const params = {
      action: 'setDataDir',
      dataDir: r, 
    }
    ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
      ElMessage.success(res);
    }) 
  })      
}

function openDir() {
  const params = {
    action: 'openDataDir',
  }
  ipc.invoke(ipcApiRoute.framework.sqlitedbOperation, params).then(res => {
    ElMessage.success(res);
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
