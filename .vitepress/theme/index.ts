// 合并后的 VitePress 站点主题入口：
// 默认主题负责文档站，营销页通过 frontmatter `layout: marketing` 走独立布局。
import DefaultTheme from 'vitepress/theme'
import './marketing/marketing.css'
import Layout from './Layout.vue'

export default { ...DefaultTheme, Layout }
