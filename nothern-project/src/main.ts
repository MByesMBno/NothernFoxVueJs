import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/router.ts'
import './style.css'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import { Theme } from '@primevue/themes';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
   theme: {
    preset: Aura,
    options: {
      darkMode: false,
      prefix: 'p',
      cssLayer: false
    }
  }
})
app.use(ToastService)
app.mount('#app')
