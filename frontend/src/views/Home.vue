<template>
    <div>
      <h1>Board: {{ boardID }}</h1>
      <div>
        <input v-model="message" @keyup.enter="sendMessage" placeholder="Type and hit enter..." />
      </div>
      <div v-for="(msg, idx) in messages" :key="idx">{{ msg }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  const boardID = ref(route.params.boardID || 'default');
  const socket = ref(null);
  const message = ref('');
  const messages = ref([]);
  
  onMounted(() => {
    socket.value = new WebSocket(`ws://localhost:3001/${boardID.value}`);
  
    socket.value.onmessage = (event) => {
      messages.value.push(`[Peer]: ${event.data}`);
    };
  });
  
  onBeforeUnmount(() => {
    socket.value?.close();
  });
  
  function sendMessage() {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(message.value);
      messages.value.push(`[Me]: ${message.value}`);
      message.value = '';
    }
  }
  </script>
  