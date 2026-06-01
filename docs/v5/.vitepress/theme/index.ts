import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import WwAds from '../components/WwAds.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    // Inject the WWAds slot at the top of the doc content area,
    // replicating vdoing's htmlModules.pageT behavior.
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(WwAds),
    })
  },
}
