<template>
  <div id="app-hw-bluetooth">
    <div class="one-block-1">
      <span>
        1. 打印机设备
      </span>
    </div>  
    <div class="one-block-2">
      <a-button @click="getPrinter()"> 获取打印机列表 </a-button>
    </div>
    <div class="one-block-2">
      <a-list size="small" bordered :data-source="printerList">
        <a-list-item slot="renderItem" slot-scope="item">
          {{ item.displayName }} {{ defaultDevice(item) }}
        </a-list-item>
        <div slot="header">
          设备列表
        </div>
      </a-list>
    </div>
    <div class="one-block-1">
      <span>
        2. 打印内容
      </span>
    </div>  
    <div class="one-block-2">
      <a-button @click="doPrint(0)"> 打印一个页面 </a-button>
    </div>      
  </div>
</template>
<script>
import { ipcApiRoute } from '@/api/main'

export default {
  data() {
    return {
      defaultDeviceName: '',
      printerList: [],
      views: [
        {
          type: 'html',
          content: '/public/html/view_example.html'
        },        
      ],
    };
  },
  mounted () {
    this.init();
  },  
  methods: {
    init () {
      const self = this;
      // 避免重复监听，或者将 on 功能写到一个统一的地方，只加载一次
      this.$ipc.removeAllListeners(ipcApiRoute.hardware.printStatus);
      this.$ipc.on(ipcApiRoute.hardware.printStatus, (event, result) => {
        console.log('result', result);
        self.$message.info('打印中...');
      })
    },    
    getPrinter () {
      this.$ipcInvoke(ipcApiRoute.hardware.getPrinterList, {}).then(res => {
        this.printerList = res;
      }) 
    },
    doPrint (index) {
      console.log('defaultDeviceName:', this.defaultDeviceName)
      const params = {
        view: this.views[index],
        deviceName: this.defaultDeviceName
      };
      this.$ipc.send(ipcApiRoute.hardware.print, params)

    },
    defaultDevice (item) {
      let desc = "";
      if (item.isDefault) {
        desc = "- 默认";
        this.defaultDeviceName = item.name;
      }
      
      return desc;
    } 
  }
};
</script>
<style lang="less" scoped>
#app-hw-bluetooth {
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
