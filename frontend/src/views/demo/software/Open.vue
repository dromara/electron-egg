<template>
  <div id="app-demo-software-open">
    <div class="one-block-1">
      <span>
        调用其它软件（exe、bash等可执行程序）
      </span>
      <p/>
      注：请先将【powershell.exe】复制到【electron-egg/build/extraResources】目录中
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
import { localApi } from '@/api/main'

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
			localApi('openSoftware', {id:id}).then(res => {
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
#app-demo-software-open {
  padding: 0px 10px;
  text-align: center;
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
