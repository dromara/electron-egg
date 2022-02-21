<template>
  <div id="app-base-software-open">
    <div class="one-block-1">
      <span>
        1. 调用其它软件（exe、bash等可执行程序）
      </span>
      <p/>
      <span class="sub-content">
        注：请先将【powershell.exe】复制到【electron-egg/build/extraResources】目录中
      </span> 
    </div>  
    <div class="one-block-2">
      <a-list bordered :data-source="data">
        <a-list-item slot="renderItem" slot-scope="item" @click="openSoft(item.id)">
          {{ item.content }}
          <a-button type="link">
            执行
          </a-button>
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>
<script>
import { requestEggApi } from '@/api/main'

const data = [
  {
    content: 'powershell.exe',
    id: 'powershell'
  }
];

export default {
  data() {
    return {
      data,
    };
  },
  methods: {
    openSoft (id) {
			requestEggApi('openSoftware', {id:id}).then(res => {
				if (res.code !== 0) {
					this.$message.info(res.msg)
					return false
				}
			}).catch(err => {
				console.log('err:', err)
			})
    },
  }
};
</script>
<style lang="less" scoped>
#app-base-software-open {
  padding: 0px 10px;
  text-align: left;
  width: 100%;
  .one-block-1 {
    font-size: 16px;
    padding-top: 10px;
    .sub-content {
      font-size: 14px;
    }
  }
  .one-block-2 {
    padding-top: 10px;
  }
}
</style>
