import { createApp } from 'vue'
import Main from './Main.vue'
import router from './router'
import './assets/main.css'
import './assets/componentStyles.css' // 添加这一行
import naive from 'naive-ui'
import './registerServiceWorker'

const app = createApp(Main)
app.use(naive)

app.use(router)
app.mount('#app')
