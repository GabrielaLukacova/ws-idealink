<template>
  <div class="board-container">
    <header>
      <div class="header-title">
        <h1 @click="createNewBoard" style="cursor:pointer">IdeaLink</h1>
        <p>Collaborate with others in real-time</p>
      </div>
      <div class="header-buttons">
        <button class="btn" @click="createNewBoard">+ New board</button>
        <button class="btn" @click="copyLink">Copy link</button>
      </div>
    </header>

    <div class="drawing-wrapper">
      <canvas
        id="drawingCanvas"
        ref="drawingCanvas"
        width="1200"
        height="600"
        class="drawing-canvas"
      ></canvas>

      <div id="stickyNotes" class="sticky-notes">
        <div
          v-for="(note, index) in stickyNotes"
          :key="note.id"
          class="sticky-note"
          :style="{ top: note.top + 'px', left: note.left + 'px' }"
          @mousedown="startDrag(note, $event)"
        >
          <textarea
            v-model="note.text"
            placeholder="Write your note here..."
            @input="onStickyNoteChange(index)"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="bottom-buttons fixed-buttons">
      <button class="btn" @click="toggleDrawing">
        <span>✏️</span>
        {{ isDrawingEnabled ? 'Stop drawing' : 'Start drawing' }}
      </button>
      <button class="btn" @click="addStickyNoteLocal">
        <span>🗒️</span>
        Add sticky note
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { connectToWS } from '@/sockets/ws-client'
import { useStickyNotes } from '@/composables/useStickyNotes'

const router = useRouter()
const route = useRoute()
const boardId = computed(() => route.params.boardID || 'default-board')

const drawingCanvas = ref(null)
let ctx = null
const paths = ref([])
const isDrawing = ref(false)
const isDrawingEnabled = ref(false)

const { stickyNotes, addStickyNote, updateStickyNote, resetNotes } = useStickyNotes(boardId)

let dragNote = null
let dragOffset = { x: 0, y: 0 }
let ws = null
let sendWS = () => {} // default noop function

watch(boardId, () => {
  if (ctx) ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
  paths.value = []
  resetNotes()
})

function toggleDrawing() {
  isDrawingEnabled.value = !isDrawingEnabled.value
  const canvas = drawingCanvas.value
  if (!canvas) return

  if (isDrawingEnabled.value) {
    ctx = canvas.getContext('2d')
    canvas.addEventListener('mousedown', startPath)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', endDrawing)
    canvas.addEventListener('mouseleave', endDrawing)
  } else {
    canvas.removeEventListener('mousedown', startPath)
    canvas.removeEventListener('mousemove', draw)
    canvas.removeEventListener('mouseup', endDrawing)
    canvas.removeEventListener('mouseleave', endDrawing)
  }
}

function getOffsetPos(evt) {
  const rect = drawingCanvas.value.getBoundingClientRect()
  const scaleX = drawingCanvas.value.width / rect.width
  const scaleY = drawingCanvas.value.height / rect.height
  return {
    x: (evt.clientX - rect.left) * scaleX,
    y: (evt.clientY - rect.top) * scaleY
  }
}

function startPath(event) {
  if (!ctx) return
  isDrawing.value = true
  const { x, y } = getOffsetPos(event)
  ctx.beginPath()
  ctx.moveTo(x, y)
  paths.value.push([{ x, y }])
  sendWS({ type: 'startDrawing', x, y, boardId: boardId.value })
}

function draw(event) {
  if (!isDrawing.value || !ctx) return
  const { x, y } = getOffsetPos(event)
  ctx.lineTo(x, y)
  ctx.stroke()
  paths.value[paths.value.length - 1].push({ x, y })
  sendWS({ type: 'drawing', x, y, boardId: boardId.value })
}

function endDrawing() {
  isDrawing.value = false
  sendWS({ type: 'endDrawing', boardId: boardId.value })
}

function createNewBoard() {
  const id = Math.random().toString(36).substring(2, 8)
  router.push(`/${id}`)
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => alert('Board link copied!'))
}

function addStickyNoteLocal() {
  const newNote = {
    id: Date.now().toString(),
    text: '',
    top: 50,
    left: 50
  }
  addStickyNote(newNote)
  sendWS({ type: 'addSticky', note: newNote, boardId: boardId.value })
}

function onStickyNoteChange(index) {
  sendWS({ type: 'updateSticky', note: stickyNotes.value[index], boardId: boardId.value })
}

function startDrag(note, event) {
  dragNote = note
  dragOffset.x = event.clientX - note.left
  dragOffset.y = event.clientY - note.top
  window.addEventListener('mousemove', drag)
  window.addEventListener('mouseup', stopDrag)
}

function drag(event) {
  if (!dragNote) return
  dragNote.left = event.clientX - dragOffset.x
  dragNote.top = event.clientY - dragOffset.y
  const idx = stickyNotes.value.findIndex(n => n.id === dragNote.id)
  if (idx !== -1) updateStickyNote(idx, { top: dragNote.top, left: dragNote.left })
  sendWS({ type: 'updateSticky', note: dragNote, boardId: boardId.value })
}

function stopDrag() {
  dragNote = null
  window.removeEventListener('mousemove', drag)
  window.removeEventListener('mouseup', stopDrag)
}

function handleWSMessage(data) {
  if (!data || data.boardId !== boardId.value) return
  switch (data.type) {
    case 'fullState':
      stickyNotes.value.splice(0, stickyNotes.value.length, ...data.notes)
      paths.value = data.paths || []
      if (ctx && data.paths) {
        ctx.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
        data.paths.forEach(path => {
          ctx.beginPath()
          path.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y)
            else ctx.lineTo(point.x, point.y)
          })
          ctx.stroke()
        })
      }
      break
    case 'addSticky':
      if (!stickyNotes.value.find(n => n.id === data.note.id)) addStickyNote(data.note)
      break
    case 'updateSticky':
      const idx = stickyNotes.value.findIndex(n => n.id === data.note.id)
      if (idx !== -1) updateStickyNote(idx, data.note)
      break
    case 'startDrawing':
      if (ctx) ctx.beginPath(), ctx.moveTo(data.x, data.y)
      break
    case 'drawing':
      if (ctx) ctx.lineTo(data.x, data.y), ctx.stroke()
      break
    case 'endDrawing':
      break
  }
}

onMounted(() => {
  const { socket, send } = connectToWS(boardId.value, handleWSMessage)
  ws = socket
  sendWS = send
})

onBeforeUnmount(() => {
  if (ws) ws.close()
})
</script>




<style scoped>
.board-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
header {
  position: relative;        
  padding: 2rem;
  color: #acac92;
  display: flex;
  align-items: center;
  justify-content: flex-end; 
  gap: 1rem;
}

.header-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  pointer-events: none; 
  user-select: none;
  width: max-content;  
}

.header-title * {
  pointer-events: auto; 
  user-select: auto;
}

.header-buttons {
  display: flex;
  gap: 1rem;
}

.drawing-wrapper {
  position: relative;
  flex-grow: 1;
  overflow: hidden;
}

.drawing-canvas {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border: none;
  display: block;
}

.sticky-notes {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sticky-note {
  background-color: #fff59d;
  padding: 10px;
  border-radius: 8px;
  width: 180px;
  min-height: 140px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  position: absolute;
  cursor: grab;
  pointer-events: auto;
}

.sticky-note textarea {
  width: 100%;
  height: 100%;
  border: none;
  background: none;
  font-size: 1rem;
  color: #333;
  resize: none;
  outline: none;
}

.fixed-buttons {
  position: fixed;
  bottom: 3rem;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  background: transparent;
  z-index: 10;
}

.btn {
  background-color: #acac92;
  color: white;
  border: none;
  padding: 0.7rem 1.5rem;
  font-size: 1rem;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn:hover {
  background-color: #9b9b7b;
  transform: translateY(-1px);
}
</style>
