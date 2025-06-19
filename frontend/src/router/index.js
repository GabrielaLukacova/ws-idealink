import { createRouter, createWebHistory } from 'vue-router'
import BoardView from '@/views/BoardView.vue'
import Home from '@/views/Home.vue'

// Define app routes
const routes = [
  { path: '/', component: Home },                   // Home screen
  { path: '/:boardID', component: BoardView },      // Dynamic board route
  { path: '/:catchAll(.*)', redirect: '/' },        // Redirect unknown routes
]

// Create and export the Vue Router instance
export default createRouter({
  history: createWebHistory('/idealink/'), // Base path for deployment
  routes,
})