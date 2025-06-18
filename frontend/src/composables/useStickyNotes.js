// src/composables/useStickyNotes.js
import { ref, onMounted, onUnmounted } from 'vue'
import { connectToWS } from '@/sockets/ws-client'

export function useStickyNotes(boardId) {
  const stickyNotes = ref([])

  let wsSend = null
  let wsSocket = null

  // Handle messages from WS
  function onMessage(data) {
    if (!data || data.boardId !== boardId) return

    if (data.type === 'stickyNoteCreated') {
      // Avoid adding duplicate notes
      if (!stickyNotes.value.find(n => n.id === data.note.id)) {
        stickyNotes.value.push(data.note)
      }
    } else if (data.type === 'updateSticky') {
      const note = stickyNotes.value.find(n => n.id === data.note.id)
      if (note) {
        note.left = data.note.left
        note.top = data.note.top
      }
    }
  }

  onMounted(() => {
    const { socket, send } = connectToWS(boardId, onMessage)
    wsSend = send
    wsSocket = socket

    // Optional: handle socket close/reconnect here if needed
  })

  onUnmounted(() => {
    if (wsSocket) {
      wsSocket.close()
    }
  })

  function addStickyNote() {
    const note = {
      id: crypto.randomUUID(),
      text: '',
      top: 100,
      left: 100
    }
    stickyNotes.value.push(note)

    wsSend && wsSend({
      type: 'stickyNoteCreated',
      boardId,
      note
    })
  }

  function startDrag(note, event) {
    const offsetX = event.clientX - note.left
    const offsetY = event.clientY - note.top

    const moveNote = (moveEvent) => {
      note.left = moveEvent.clientX - offsetX
      note.top = moveEvent.clientY - offsetY

      wsSend && wsSend({
        type: 'updateSticky',
        boardId,
        note: {
          id: note.id,
          left: note.left,
          top: note.top
        }
      })
    }

    const stopDragging = () => {
      document.removeEventListener('mousemove', moveNote)
      document.removeEventListener('mouseup', stopDragging)
    }

    document.addEventListener('mousemove', moveNote)
    document.addEventListener('mouseup', stopDragging)
  }

  return {
    stickyNotes,
    addStickyNote,
    startDrag
  }
}
