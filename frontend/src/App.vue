<!-- src/App.vue -->
<template>
  <div class="container">
    <header>
      <h1>Welcome to Modern</h1>
      <p>Collaborate with friends in real-time</p>
    </header>

    <button class="btn" @click="createNewBoard">+ New Board</button>

    <router-view /> <!-- Dynamic board content -->
    
    <footer>
      <p>© 2025 Modern Jam</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function createNewBoard() {
  const id = Math.random().toString(36).substring(2, 8)
  router.push(`/${id}`)
}
</script>
