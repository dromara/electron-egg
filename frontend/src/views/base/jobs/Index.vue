<template>
  <div id="app-base-jobs">
    <div class="one-block-1">
      <span>
        1. 任务 / 并发任务
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="runJob(1)">执行任务1</a-button>
        进度：{{ progress1 }}
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="runJob(2)">执行任务2</a-button>
        进度：{{ progress2 }}
      </a-space>            
    </div>
    <div class="one-block-1">
      <span>
        2. 任务池 / 并发任务
      </span>
    </div>  
    <div class="one-block-2">
      <a-space>
        <a-button @click="createPool()">创建进程池</a-button>
        进程pids：{{ processPids }}
      </a-space>
      <p></p>      
      <a-space>
        <a-button @click="runJobByPool(3)">执行任务3</a-button>
        进度：{{ progress3 }}
      </a-space>
      <p></p>
      <a-space>
        <a-button @click="runJobByPool(4)">执行任务4</a-button>
        进度：{{ progress4 }}
      </a-space>            
    </div>            
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main'
export default {
  data() {
    return {
      progress1: 0,
      progress2: 0,
      progress3: 0,
      progress4: 0,
      processPids: '',
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      this.$ipc.removeAllListeners(ipcApiRoute.timerJobProgress);
      this.$ipc.removeAllListeners(ipcApiRoute.createPoolNotice);
      //this.$ipc.removeAllListeners(ipcApiRoute.timerJobProgressByPool);

      // 监听任务进度
      this.$ipc.on(ipcApiRoute.timerJobProgress, (event, result) => {
        console.log('[ipcRenderer] [someJob] result:', result);

        switch (result.jobId) {
          case 1:
            this.progress1 = result.number;
            break;
          case 2:
            this.progress2 = result.number;
            break;
          case 3:
            this.progress3 = result.number;
            break;
          case 4:
            this.progress4 = result.number;            
            break;
        }
      })

      // 监听pool
      this.$ipc.on(ipcApiRoute.createPoolNotice, (event, result) => {
        console.log('[ipcRenderer] [createPoolNotice] result:', result);

        let pidsStr = JSON.stringify(result);
        this.processPids = pidsStr;
      })
      // 监听任务进度 pool
      // this.$ipc.on(ipcApiRoute.timerJobProgressByPool, (event, result) => {
      //   console.log('[ipcRenderer] [someJobByPool] result:', result);

      //   switch (result.jobId) {
      //     case 1:
      //       this.progress3 = result.number;
      //       break;
      //     case 2:
      //       this.progress4 = result.number;
      //       break;
      //   }
      // })    
    },
    runJob(jobId) {
      let params = {
        id: jobId,
        type: 'timer'
      }
      this.$ipc.send(ipcApiRoute.someJob, params)
    },
    createPool() {
      let params = {
        number: 3,
      }
      this.$ipc.send(ipcApiRoute.createPool, params);
    },
    runJobByPool(jobId) {
      let params = {
        id: jobId,
        type: 'timer'
      }
      this.$ipc.send(ipcApiRoute.someJobByPool, params)
    },
  }
}
</script>
<style lang="less" scoped>
#app-base-jobs {
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
