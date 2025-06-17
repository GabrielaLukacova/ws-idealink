// backend/server.js
const http = require('http');
const WebSocket = require('ws');
const url = require('url');

const server = http.createServer();
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

server.listen(3001, () => console.log('WebSocket server running on ws://localhost:3001'));
