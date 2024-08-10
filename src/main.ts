import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
// import App from './views/SelectView.vue'

import Antd, { Button, Dropdown, message } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app
  .use(createPinia())
  .use(Antd)
  .use(Button)
  .use(ElementPlus)
  .use(Dropdown)

app.mount('#app')

app.config.globalProperties.$message = message