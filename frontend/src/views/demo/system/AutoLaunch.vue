<template>
  <div id="app-demo-system-launch">
    <!-- <div class="one-block-1">
      <span>
        开机启动
      </span>
    </div>   -->
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
            <a-switch v-model="autoLaunchChecked" checkedChildren="开" unCheckedChildren="关" @change="autoLaunchChange(autoLaunchChecked)" />
          </template>
        </a-list-item>
      </a-list>
    </div>
  </div>
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
#app-demo-system-launch {
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
  .set-auto {
    .ant-list-item:last-child {
      border-bottom: 1px solid #e8e8e8;
    }
  }
}  
</style>  