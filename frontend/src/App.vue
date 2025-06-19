<template>
  <div class="container">
    <router-view />
    <footer class="sticky-footer">
      <p>© 2025 IdeaLink</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, computed} from 'vue';
import { connectToWS } from './sockets/ws-client.js';
import { initDrawing, handleExternalDrawing } from './app/drawing.js';
import { useStickyNotes } from './composables/useStickyNotes.js';
import { useRoute } from 'vue-router'


const route = useRoute()
const boardID = computed(() => route.params.boardID || 'default-board')
const stickyNotes = useStickyNotes(boardID);

function handleWSMessage(message) {
  switch (message.type) {
    case 'startDrawing':
    case 'drawing':
    case 'endDrawing':
      handleExternalDrawing(message);
      break;

    // sticky notes handled inside useStickyNotes's own WS listener
    default:
      console.log('[WS] Unknown message type:', message.type);
  }
}

// onMounted(() => {
//   const { send } = connectToWS(boardId.value, handleWSMessage);

//   initDrawing(send);
// });
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
