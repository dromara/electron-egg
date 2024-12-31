import {defineConfig} from 'vite'
import {resolve} from 'path';
import dts from 'vite-plugin-dts'

export default defineConfig({
  define: {'process.env': {}},
  build: {
    minify: "esbuild",
    lib: {
      entry: resolve(__dirname, './src/electron/main.ts'),
      formats: ['cjs']
    },
    outDir: "runtime",
  },
  plugins: [dts({rollupTypes: true}),
  ],
})
