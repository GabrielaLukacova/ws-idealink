<!-- src/views/BoardView.vue -->
<template>
    <div class="board">
      <!-- Sticky Notes Section -->
      <div class="sticky-notes-container">
        <button class="btn" @click="addStickyNote">Add Sticky Note</button>
        <div id="stickyNotes" class="sticky-notes">
          <div
            v-for="(note, index) in stickyNotes"
            :key="index"
            class="sticky-note"
            :style="{ top: note.top + 'px', left: note.left + 'px' }"
            @mousedown="startDrag(note, $event)"
          >
            <textarea v-model="note.text" placeholder="Write your note here..."></textarea>
          </div>
        </div>
      </div>
  
      <!-- Drawing Canvas -->
      <div class="drawing-container">
        <button class="btn" @click="startDrawing">Start Drawing</button>
        <canvas
          id="drawingCanvas"
          ref="drawingCanvas"
          width="800"
          height="500"
          class="drawing-canvas"
        ></canvas>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { connectToWS } from '@/sockets/ws-client'
  
  const route = useRoute()
  const boardId = route.params.boardID
  
  const stickyNotes = ref([])
  const isDrawing = ref(false)
  const drawingCanvas = ref(null)
  let ctx = null
  
  function addStickyNote() {
    stickyNotes.value.push({
      text: '',
      top: 100,
      left: 100
    })
  }
  
  function startDrawing() {
    const canvas = drawingCanvas.value
    ctx = canvas.getContext('2d')
    isDrawing.value = true
  
    canvas.addEventListener('mousedown', startPath)
    canvas.addEventListener('mousemove', draw)
    canvas.addEventListener('mouseup', endDrawing)
    canvas.addEventListener('mouseleave', endDrawing)
  }
  
  function startPath(event) {
    if (ctx) {
      ctx.beginPath()
      ctx.moveTo(event.offsetX, event.offsetY)
    }
  }
  
  function draw(event) {
    if (isDrawing.value && ctx) {
      ctx.lineTo(event.offsetX, event.offsetY)
      ctx.stroke()
    }
  }
  
  function endDrawing() {
    isDrawing.value = false
  }
  
  function startDrag(note, event) {
    const offsetX = event.clientX - note.left
    const offsetY = event.clientY - note.top
  
    const moveNote = (moveEvent) => {
      note.left = moveEvent.clientX - offsetX
      note.top = moveEvent.clientY - offsetY
    }
  
    document.addEventListener('mousemove', moveNote)
    document.addEventListener('mouseup', () => {
      document.removeEventListener('mousemove', moveNote)
    })
  }
  
  onMounted(() => {
    connectToWS(boardId)
  })
  </script>
  