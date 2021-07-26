<template>
  <div>
    <h3 :style="{ marginBottom: '16px' }">
      demo5 打开其它软件
    </h3>
    <a-list bordered :data-source="data">
      <a-list-item @click="openSoft(item.id)" slot="renderItem" slot-scope="item">
        {{ item.content }}
        <a-button type="link">
          打开
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
      console.log('id:', id)
      const params = {
        'id': id
      }
			localApi('openSoftware', params).then(res => {
				if (res.code !== 0) {
					// this.$message.info('error')
					return false
				}
				this.$message.info('成功')
			}).catch(err => {
				console.log('err:', err)
			})
    },
  }
};
</script>
<style></style>
