<template>
  <div id="app-base-system-launch">
    <div class="one-block-2">
      <a-list class="set-auto" itemLayout="horizontal">
        <a-list-item style="text-align: left;">
          <a-list-item-meta>
            <template v-slot:title>
              <a>启动</a>
            </template>
            <template v-slot:description>
              <span>
                开机自动启动
              </span>
            </template>
          </a-list-item-meta>
          <template v-slot:actions>
            <a-switch v-model="autoLaunchChecked" checkedChildren="开" unCheckedChildren="关" @change="autoLaunchChange()" />
          </template>
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main'

export default {
  data () {
    return {
      autoLaunchChecked: false
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    init () {
      // todo .....
      const self = this;
      self.$ipcInvoke(ipcApiRoute.os.autoLaunch, 'check').then(result => {
        console.log('[ipcRenderer] [autoLaunch] result:', result)
        this.autoLaunchChecked = result.status;
      })      
    },
    autoLaunchChange (checkStatus) {
      console.log('[ipcRenderer] [autoLaunch] self.autoLaunchChecked:', this.autoLaunchChecked)
    },
  }
}
</script>
<style lang="less" scoped>
#app-base-system-launch {
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
  .set-auto {
    .ant-list-item:last-child {
      border-bottom: 1px solid #e8e8e8;
    }
  }
}  
</style>  