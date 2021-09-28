<template>
  <div id="app-demo-open-file">
    <div class="one-block-1">
      <span>
        打开文件夹
      </span>
    </div>  
    <div class="one-block-2">
      <a-list :grid="{ gutter: 16, column: 4 }" :data-source="data">
        <a-list-item slot="renderItem" slot-scope="item" @click="openDirectry(item.id)">
          <a-card :title="item.content">
            <a-button type="link">
              打开
            </a-button>
          </a-card>
        </a-list-item>
      </a-list>
    </div>
  </div>
</template>
<script>
import { localApi } from '@/api/main'

const data = [
  {
    content: '【下载】目录',
    id: 'download'
  },
  {
    content: '【图片】目录',
    id: 'picture'
  },
  {
    content: '【文档】目录',
    id: 'doc'
  },
  {
    content: '【音乐】目录',
    id: 'music'
  }
];

export default {
  data() {
    return {
      data,
    };
  },
  methods: {
    openDirectry (id) {
      const params = {
        'id': id
      }
      localApi('openDir', params).then(res => {
        if (res.code !== 0) {
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
#app-demo-open-file {
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
