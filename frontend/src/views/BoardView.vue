<template>
    <div class="board">
      <h1>Board: {{ boardId }}</h1>
  
      <div id="stickyNotes"></div>
      <button @click="onAddNote">Add Sticky Note</button>
  
      <canvas
        id="drawingCanvas"
        width="800"
        height="600"
        style="border: 1px solid #ccc;"
      ></canvas>
      <button id="startDrawingBtn" @click="toggleDrawing">Start Drawing</button>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { connectToWS } from '@/sockets/ws-client'
  import { toggleDrawingMode } from '@/app/drawing'
  import { addStickyNote } from '@/app/stickynote'
  
  const route = useRoute()
  const boardId = ref(route.params.boardID)
  
  const toggleDrawing = () => {
    toggleDrawingMode()
  }
  
  const onAddNote = () => {
    addStickyNote()
  }
  
  onMounted(() => {
    connectToWS(boardId.value)
  })
  </script>
  
  <style scoped>
  .board {
    padding: 20px;
  }
  #drawingCanvas {
    margin-top: 20px;
    display: block;
  }
  .sticky-note {
    width: 150px;
    height: 150px;
    background-color: yellow;
    border: 1px solid black;
    padding: 10px;
    margin: 10px;
    resize: both;
    overflow: auto;
    position: absolute;
    cursor: grab;
  }
  </style>
  