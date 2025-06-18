const http = require('http')
const WebSocket = require('ws')
const url = require('url')

const PORT = process.env.PORT || 3000
const rooms = new Map() 

const server = http.createServer((req, res) => {
  res.writeHead(200)
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

// Ping every 30s to keep connections alive
setInterval(() => {
  wss.clients.forEach((ws) => {
    if (!ws.isAlive) return ws.terminate()
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

server.listen(PORT, () => {
  console.log(`WebSocket Server running on :${PORT}`)
})
