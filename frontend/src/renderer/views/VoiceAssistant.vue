<template>
  <!-- No changes to template section -->
</template>

<script>
import { ipcRenderer } from 'electron';
import logger from '../utils/logger';

export default {
  methods: {
    async getAudioDevices() {
      try {
        const result = await ipcRenderer.invoke('controller/framework/jsondbOperation', {
          action: 'get',
          table: 'settings',
          key: 'audioDevices'
        });

        if (result && result.success) {
          this.audioDevices = result.data || [];
          logger.info('获取音频设备列表成功:', this.audioDevices);
        } else {
          logger.error('获取音频设备列表失败:', result?.message || '未知错误');
          this.audioDevices = [];
        }
      } catch (error) {
        logger.error('获取音频设备列表时发生错误:', error);
        this.audioDevices = [];
      }
    },
  },
};
</script>

<style>
  /* No changes to style section */
</style>
