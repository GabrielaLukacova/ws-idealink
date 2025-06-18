/* src/composables/useStickyNotes.js */
import { ref } from 'vue'
import { useSocket } from './useSocket'

export function useStickyNotes() {
  const stickyNotes = ref([])

  const { socket, boardId } = useSocket()

  // Add new sticky note and emit to other clients
  function addStickyNote() {
    const note = {
      id: crypto.randomUUID(),
      text: '',
      top: 100,
      left: 100
    }

    stickyNotes.value.push(note)

    socket.value.emit('stickyNoteCreated', {
      boardId: boardId.value,
      note
    })
  }

  // Start dragging a sticky note
  function startDrag(note, event) {
    const offsetX = event.clientX - note.left
    const offsetY = event.clientY - note.top

    const moveNote = (moveEvent) => {
      note.left = moveEvent.clientX - offsetX
      note.top = moveEvent.clientY - offsetY

      // Emit position while dragging
      socket.value.emit('updateSticky', {
        boardId: boardId.value,
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

  // Receive a new sticky note from another user
  function onStickyNoteCreated(data) {
    if (data.boardId !== boardId.value) return
    stickyNotes.value.push(data.note)
  }

  // Update sticky note position from other clients
  function onUpdateSticky(data) {
    if (data.boardId !== boardId.value) return
    const note = stickyNotes.value.find(n => n.id === data.note.id)
    if (note) {
      note.left = data.note.left
      note.top = data.note.top
    }
  }

  socket.value.on('stickyNoteCreated', onStickyNoteCreated)
  socket.value.on('updateSticky', onUpdateSticky)

  return {
    stickyNotes,
    addStickyNote,
    startDrag
  }
}
