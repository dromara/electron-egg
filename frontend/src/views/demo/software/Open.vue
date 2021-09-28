<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      demo5 调用其它软件（exe、bash等可执行程序）
    </h3>
    注：请先将【powershell.exe】复制到【electron-egg/build/extraResources】目录中
    <a-list bordered :data-source="data">
      <a-list-item @click="openSoft(item.id)" slot="renderItem" slot-scope="item">
        {{ item.content }}
        <a-button type="link">
          执行
        </a-button>
      </a-list-item>
    </a-list>
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
      console.log('id:', id);
			localApi('openSoftware', {}).then(res => {
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
<style></style>
