// src/composables/useSocket.js
import { ref } from 'vue'
import { io } from 'socket.io-client'

const socket = ref(io('https://ws-idealink.onrender.com'))

const boardId = ref(window.location.pathname.split('/').pop() || 'default-board')

export function useSocket() {
  return {
    socket,
    boardId
  }
}