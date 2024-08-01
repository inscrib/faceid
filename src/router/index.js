import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Upload from '../views/Upload.vue'
import About from '../views/About.vue'
import Deploy from '../views/deploy.vue'
import Database from '../views/database.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/upload', name: 'Upload', component: Upload },
  { path: '/about', name: 'About', component: About },
  { path: '/deploy', name: 'Deploy', component: Deploy },
  { path: '/database', name: 'Database', component: Database }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
