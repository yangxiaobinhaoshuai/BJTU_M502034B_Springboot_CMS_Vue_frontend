import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import Antd, { Button, Dropdown, message } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)

app
  .use(createPinia())
  .use(Antd)
  .use(Button)
  .use(Dropdown)

app.mount('#app')

app.config.globalProperties.$message = message