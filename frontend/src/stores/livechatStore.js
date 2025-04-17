import { defineStore } from 'pinia';

// 定义直播场控相关的store
export const useLivechatStore = defineStore('livechatStore', {
  state: () => ({
    // 场控组相关状态
    selectedControlTable: '',
    
    // 关键词组相关状态
    selectedReplyTable: '',
    
    // 直播间连接状态
    roomId: '',
    connected: false,
  }),
  
  actions: {
    // 设置选中的场控组
    setSelectedControlTable(tableName) {
      this.selectedControlTable = tableName;
    },
    
    // 设置选中的关键词组
    setSelectedReplyTable(tableName) {
      this.selectedReplyTable = tableName;
    },
    
    // 设置直播间ID
    setRoomId(id) {
      this.roomId = id;
    },
    
    // 设置连接状态
    setConnected(status) {
      this.connected = status;
    }
  },
  
  persist: {
    key: 'livechat-state',
    storage: localStorage,
  },
}); 