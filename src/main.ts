import './assets/base.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

//  处理警告Chrome51 版本更新以后，增加了新的事件捕获机制－Passive Event Listeners。
import 'default-passive-events';


const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(createPinia())

//全局引入图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}


app.mount('#app')