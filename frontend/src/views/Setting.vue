<template>
  <a-list id="set" itemLayout="horizontal">
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
        <a-switch checkedChildren="开" unCheckedChildren="关" v-model="autoLaunchChecked" @change="autoLaunchChange(autoLaunchChecked)" />
      </template>
    </a-list-item>
  </a-list>
</template>
<script>
import { localApi } from '@/api/main'

export default {
  data () {
    return {
      autoLaunchChecked: false
    }
  },
  mounted () {
    this.autoLaunchInit()
  },
  methods: {
    autoLaunchInit () {
      localApi('autoLaunchIsEnabled', {}).then(res => {
        if (res.code !== 0) {
          return false
        }
        this.autoLaunchChecked = res.data.isEnabled;
      }).catch(err => {
        console.log('err:', err)
      })
    },
    autoLaunchChange (checkStatus) {
      const params = {
        'checkStatus': checkStatus
      }
      if (checkStatus) {
        localApi('autoLaunchEnable', params).then(res => {
          if (res.code !== 0) {
            return false
          }
          this.autoLaunchChecked = res.data.isEnabled;
        }).catch(err => {
          console.log('err:', err)
        })
      } else {
        localApi('autoLaunchDisable', params).then(res => {
          if (res.code !== 0) {
            return false
          }
          this.autoLaunchChecked = res.data.isEnabled;
        }).catch(err => {
          console.log('err:', err)
        })        
      }
    },
  }
}
</script>
<style lang="less" scoped>
// 嵌套
#set {
  .ant-list-item:last-child {
    border-bottom: 1px solid #e8e8e8;
  }
}  
</style>  