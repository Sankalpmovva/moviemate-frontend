import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

//Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css'
// Bootstrap JS (optional, for dropdowns, modals, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

createApp(App)
  .use(router)
  .mount('#app')
