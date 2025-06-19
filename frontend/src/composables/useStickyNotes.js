// src/composables/useStickyNotes.js
import { ref, onMounted, onUnmounted } from 'vue'
import { connectToWS } from '@/sockets/ws-client'

export function useStickyNotes(boardId) {
  const stickyNotes = ref([])

  let wsSend = null
  let wsSocket = null

  // Handle messages from WS
  function onMessage(data) {
    if (!data || data.boardId !== boardId.value) return

    if (data.type === 'stickyNoteCreated') {
      if (!stickyNotes.value.find(n => n.id === data.note.id)) {
        stickyNotes.value.push(data.note)
      }
    } else if (data.type === 'updateSticky') {
      const note = stickyNotes.value.find(n => n.id === data.note.id)
      if (note) {
        note.left = data.note.left
        note.top = data.note.top
        note.text = data.note.text || note.text
      }
    }
  }

  onMounted(() => {
    const { socket, send } = connectToWS(boardId.value, onMessage)
    wsSend = send
    wsSocket = socket
  })

  onUnmounted(() => {
    if (wsSocket) {
      wsSocket.close()
    }
  })

  function addStickyNote(note = null) {
    const newNote = note || {
      id: crypto.randomUUID(),
      text: '',
      top: 100,
      left: 100
    }

    stickyNotes.value.push(newNote)

    if (!note && wsSend) {
      wsSend({
        type: 'stickyNoteCreated',
        boardId,
        note: newNote
      })
    }
  }

  function updateStickyNote(index, changes) {
    const note = stickyNotes.value[index]
    if (note) {
      Object.assign(note, changes)
    }
  }

  function startDrag(note, event) {
    const offsetX = event.clientX - note.left
    const offsetY = event.clientY - note.top

    const moveNote = (moveEvent) => {
      note.left = moveEvent.clientX - offsetX
      note.top = moveEvent.clientY - offsetY

      wsSend && wsSend({
        type: 'updateSticky',
        boardId: boardId.value,
          note: {
          id: note.id,
          left: note.left,
          top: note.top,
          text: note.text
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

  function resetNotes() {
    stickyNotes.value = []
  }

  return {
    stickyNotes,
    addStickyNote,
    updateStickyNote,
    startDrag,
    resetNotes
  }
}