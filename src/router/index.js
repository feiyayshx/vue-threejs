import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CameraControls from '../views/camera-controls.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/camera-controls',
      name: 'camera-controls',
      component: CameraControls
    }
  ]
})

export default router
