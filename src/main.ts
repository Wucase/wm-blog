import { createApp } from 'vue'

import './styles/index.css'
import App from './App.vue'
import revealOnScrollDirective from './directives/revealOnScroll'
import router from './router'
import { useAuthStore } from './stores/auth'
import { pinia } from './stores/pinia'

async function bootstrap() {
  const app = createApp(App)
  const authStore = useAuthStore(pinia)

  await authStore.restoreSession()

  app.use(pinia)
  app.use(router)
  app.directive('reveal', revealOnScrollDirective)
  app.mount('#app')
}

bootstrap()
