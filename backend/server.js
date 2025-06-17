// backend/server.js
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('WebSocket server is running.');
});

const wss = new WebSocket.Server({ server });

const rooms = new Map(); // boardID -> Set of clients

wss.on('connection', (ws, req) => {
  const { pathname } = url.parse(req.url, true);
  const boardID = pathname.split('/').pop();

  if (!rooms.has(boardID)) rooms.set(boardID, new Set());
  rooms.get(boardID).add(ws);

  ws.on('message', msg => {
    for (const client of rooms.get(boardID)) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    }
  });

  ws.on('close', () => {
    rooms.get(boardID).delete(ws);
    if (rooms.get(boardID).size === 0) rooms.delete(boardID);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
