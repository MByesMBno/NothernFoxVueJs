import Items from '@/Items.vue'
import Login from '@/Login.vue'
import Categories from '@/Categories.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/login',component:Login},
    {path:'/categories',component:Categories},
    {path:'/items',component:Items}
  ],
})

export default router
