import Items from '@/Items.vue'
import Login from '@/Login.vue'
import Categories from '@/Categories.vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import HomePage from '@/HomePage.vue'
import CreateCategory from '@/CreateCategory.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {path:'/', component:HomePage},
    {path:'/login',component:Login},
    {path:'/categories',component:Categories},
    {path:'/items',component:Items},
    {path:'/createCat', component:CreateCategory}
  ],
})

export default router
