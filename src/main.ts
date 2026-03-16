import './assets/main.css'

import { createApp } from 'vue'
import { createUnhead } from '@unhead/vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
createUnhead()
app.mount('#app')
