const http = require('http')
const WebSocket = require('ws')
const url = require('url')

// Allowed origin
const ALLOWED_ORIGIN = 'https://gabrielalukacova.dk'

const PORT = process.env.PORT || 3000
const rooms = new Map()

const server = http.createServer((req, res) => {
  // Handle preflight requests and set CORS headers
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

  console.log(`[WS] Connected to board: ${boardID}`)

  ws.isAlive = true
  ws.on('pong', () => { ws.isAlive = true })

  ws.on('message', (msg) => {
    console.log(`[${boardID}] ${msg}`)

    for (const client of rooms.get(boardID)) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg)
      }
    }
  })

  ws.on('close', () => {
    rooms.get(boardID).delete(ws)
    console.log(`[WS] Disconnected from board: ${boardID}`)
    if (rooms.get(boardID).size === 0) rooms.delete(boardID)
  })
})

// Ping clients to keep them alive
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate()
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

server.listen(PORT, () => {
  console.log(`WebSocket Server running on port ${PORT}`)
})
