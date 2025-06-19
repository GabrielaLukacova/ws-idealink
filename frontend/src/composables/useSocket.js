// Provides reactive WebSocket connection tied to current boardId

import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { connectToWS } from '@/sockets/ws-client'

const socket = ref(null) // Shared WebSocket instance
const send = ref(null)   // Send function wrapper

const route = useRoute()
// Extract board ID from route params
const boardId = route.params.boardID || 'default-board'

export function useSocket() {
  // Establish WS connection only once
  if (!socket.value) {
    const wsConnection = connectToWS(boardId, (data) => {
      // Optional: handle global messages here
      console.log('[useSocket] WS data received:', data)
    })

    socket.value = wsConnection.socket
    send.value = wsConnection.send
  }

  return {
    socket,
    send,
    boardId,
  }
}
