import { createRouter, createWebHistory } from 'vue-router'
import BoardView from '@/views/BoardView.vue'
import Home from '@/views/Home.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/:boardID', component: BoardView },
  { path: '/:catchAll(.*)', redirect: '/' },
]

export default createRouter({
  history: createWebHistory('/idealink/'),
  routes,
})