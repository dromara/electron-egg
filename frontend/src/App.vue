<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { specialIpcRoute, httpConfig } from '@/api/main';

export default {
  name: 'App',
  components: {},
  data() {
    return {};
  },
  watch: {},
  mounted() {
    this.init()
  },
  methods: {
    init: ()=>{
      var  { ipcRenderer: ipc }  = window.require && window.require('electron');
      ipc.removeAllListeners(specialIpcRoute.javaPort);
      ipc.on(specialIpcRoute.javaPort, (event, result) => {
        if (result && result !== '') {
          httpConfig.baseURL = result;
        }
      });
    }
  }
}
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
}
</style>
