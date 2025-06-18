// src/composables/useSocket.js
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { connectToWS } from '@/sockets/ws-client'

const socket = ref(null)
const send = ref(null)

const route = useRoute()
const boardId = route.params.boardID || 'default-board'

export function useSocket() {
  if (!socket.value) {
    const wsConnection = connectToWS(boardId.value, (data) => {
      // You can handle any global incoming WS data here if needed
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
