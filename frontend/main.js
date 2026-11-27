import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './index.js'
import './main.css'
createApp(App).use(createPinia()).use(router).mount('#app')
