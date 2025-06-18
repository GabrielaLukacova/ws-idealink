// server.js
const http = require('http')
const WebSocket = require('ws')
const url = require('url')

const ALLOWED_ORIGIN = 'https://gabrielalukacova.dk'
const PORT = process.env.PORT || 3000

const rooms = new Map() // boardID => Set of clients
const boardStates = new Map() // boardID => { notes: [], paths: [] }

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('WebSocket server is running.')
})

const wss = new WebSocket.Server({ server })

wss.on('connection', (ws, req) => {
  const { pathname } = url.parse(req.url, true)
  const boardID = pathname.split('/').pop()

  if (!rooms.has(boardID)) rooms.set(boardID, new Set())
  rooms.get(boardID).add(ws)

  if (!boardStates.has(boardID)) {
    boardStates.set(boardID, { notes: [], paths: [] })
  }

  const state = boardStates.get(boardID)
  ws.send(JSON.stringify({
    type: 'fullState',
    notes: state.notes,
    paths: state.paths
  }))

  console.log(`[WS] Connected to board: ${boardID}`)

  ws.isAlive = true
  ws.on('pong', () => { ws.isAlive = true })

  ws.on('message', (msg) => {
    try {
      const data = JSON.parse(msg)

      // Store in memory state
      if (data.boardId) {
        const state = boardStates.get(data.boardId)

        if (data.type === 'addSticky') {
          state.notes.push(data.note)
        } else if (data.type === 'updateSticky') {
          const note = state.notes.find(n => n.id === data.note.id)
          if (note) {
            note.left = data.note.left
            note.top = data.note.top
          }
        } else if (data.type === 'startDrawing') {
          state.paths.push([{ x: data.x, y: data.y }]) // new path
        } else if (data.type === 'drawing') {
          const lastPath = state.paths[state.paths.length - 1]
          if (lastPath) lastPath.push({ x: data.x, y: data.y })
        }
      }

      for (const client of rooms.get(boardID)) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(msg)
        }
      }
    } catch (err) {
      console.error('[WS] Invalid JSON:', err)
    }
  })

  ws.on('close', () => {
    rooms.get(boardID).delete(ws)
    console.log(`[WS] Disconnected from board: ${boardID}`)
    if (rooms.get(boardID).size === 0) {
      rooms.delete(boardID)
      // Optional: clear memory
      // boardStates.delete(boardID)
    }
  })
})

// Ping
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate()
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

server.listen(PORT, () => {
  console.log(`✅ WebSocket Server running on port ${PORT}`)
})
