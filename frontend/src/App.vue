<template>
  <div>
    <button @click="createNewBoard">+ New Board</button>
    <router-view />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

function createNewBoard() {
  const id = Math.random().toString(36).substring(2, 8); // short random ID
  router.push(`/${id}`);
}
</script>
