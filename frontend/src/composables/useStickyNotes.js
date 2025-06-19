// Composable for managing collaborative sticky notes via WebSocket connection.

import { ref, onMounted, onUnmounted } from 'vue'
import { connectToWS } from '@/sockets/ws-client'

export function useStickyNotes(boardId) {
  const stickyNotes = ref([])

  let wsSend = null // Function to send data over WS
  let wsSocket = null // WebSocket instance

  /**
   * Handle incoming WebSocket messages related to sticky notes
   */
  function onMessage(data) {
    if (!data || data.boardId !== boardId.value) return

    switch (data.type) {
      case 'stickyNoteCreated':
        if (!stickyNotes.value.find(n => n.id === data.note.id)) {
          stickyNotes.value.push(data.note)
        }
        break

      case 'updateSticky':
        const note = stickyNotes.value.find(n => n.id === data.note.id)
        if (note) {
          note.left = data.note.left
          note.top = data.note.top
          note.text = data.note.text || note.text
        }
        break
    }
  }

  /**
   * Setup WebSocket connection on component mount
   */
  onMounted(() => {
    const { socket, send } = connectToWS(boardId.value, onMessage)
    wsSend = send
    wsSocket = socket
  })

  /**
   * Clean up WebSocket connection on component unmount
   */
  onUnmounted(() => {
    if (wsSocket) {
      wsSocket.close()
    }
  })

  /**
   * Add a new sticky note and sync via WebSocket
   */
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

  /**
   * Update the sticky note locally
   */
  function updateStickyNote(index, changes) {
    const note = stickyNotes.value[index]
    if (note) {
      Object.assign(note, changes)
    }
  }

  /**
   * Drag sticky note and broadcast position updates
   */
  function startDrag(note, event) {
    const offsetX = event.clientX - note.left
    const offsetY = event.clientY - note.top

    const moveNote = (moveEvent) => {
      note.left = moveEvent.clientX - offsetX
      note.top = moveEvent.clientY - offsetY

      wsSend?.({
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

  /**
   * Clear all notes locally
   */
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