import { createRouter, createWebHistory } from 'vue-router'
import BoardView from '../views/BoardView.vue'

const routes = [
  { path: '/:boardID', component: BoardView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
