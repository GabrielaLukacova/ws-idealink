<template>
  <div class="container">
    <router-view />
    <footer class="sticky-footer">
      <p>© 2025 IdeaLink</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { connectToWS } from '@/sockets/ws-client'
import { initDrawing, handleExternalDrawing } from '@/app/drawing'
import { useStickyNotes } from '@/composables/useStickyNotes'

// Get board ID from route
const route = useRoute()
const boardID = computed(() => route.params.boardID || 'default-board')

// Reactive sticky note state for current board
const { stickyNotes } = useStickyNotes(boardID)

// Handle incoming WebSocket messages
function handleWSMessage(message) {
  if (!message) return
  if (['startDrawing', 'drawing', 'endDrawing'].includes(message.type)) {
    handleExternalDrawing(message)
  } else {
    console.log('[WS] Unknown message type:', message.type)
  }
}

// connect to websocket + initialize drawing
onMounted(() => {
  const { send } = connectToWS(boardID.value, handleWSMessage)
  initDrawing(send)
})
</script>

<style scoped>
.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
  padding: 0.8rem;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
