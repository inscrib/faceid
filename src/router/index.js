import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Upload from '../views/Upload.vue'
import About from '../views/About.vue'
import test from '../views/test.vue'
import check from '../views/check.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/upload', name: 'Upload', component: Upload },
  { path: '/about', name: 'About', component: About },
  { path: '/test', name: 'test', component: test },
  { path: '/check', name: 'check', component: check }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
