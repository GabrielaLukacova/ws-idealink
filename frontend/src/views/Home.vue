<template>
  <div class="home">
    <header>
      <h1>IdeaLink</h1>
      <p>Collaborate with others in real-time</p>
    </header>

    <main class="home-main">
      <button class="btn" @click="createNewBoard">+ Start with new board</button>
    </main>

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

<style scoped>
.home {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: center;
  padding: 2rem;
  color: #acac92;
}

.home-main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

header h1 {
    font-size: 2.5rem;
    font-weight: 500;
    margin-bottom: 0.8rem;
    padding-top: 150px;
    letter-spacing: 0.5px;
  }
  
  header p {
    font-size: 1.5rem;
  }
</style>