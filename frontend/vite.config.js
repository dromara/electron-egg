import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import ViteComponents, { AntDesignVueResolver } from 'vite-plugin-components'
import viteCompression from 'vite-plugin-compression'

import path from 'path'
// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    // 项目插件
    plugins: [
      vue(),
      vueJsx(),
      ViteComponents({
        customComponentResolvers: [AntDesignVueResolver()],
      }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 1025,
        algorithm: 'gzip',
        ext: '.gz',
      }),
    ],
    // 基础配置
    base: './',
    publicDir: 'public',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    // 代理服务配置
    // server: {
    //   host: 'https://api.wrdan.com',  
    //   port: 9527,
    //   https: false,
    //   open: true,
    //   proxy: {
    //     '/toutiao/index': {
    //       target: 'http://v.juhe.cn/',
    //       changeOrigin: true,
    //       rewrite: path => path.replace(/\/toutiao\/index/, ''),
    //     },
    //     '/ip': {
    //         changeOrigin: true,
    //         rewrite: path => path.replace(/\/ip/, ''),
    //       },
    //   },
    // },
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            '@border-color-base': '#dce3e8',
          },
          javascriptEnabled: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      brotliSize: false,
      sourcemap: false,
      terserOptions: {
        compress: {
          // 生产环境去除console及debug
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
})


