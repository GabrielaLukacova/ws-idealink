// src/sockets/ws-client.js
export function connectToWS(boardID, onMessageCallback) {
  const socket = new WebSocket(`wss://ws-idealink.onrender.com/${boardID}`);

  socket.onopen = () => {
    console.log(`[WS] Connected to board: ${boardID}`);
  };

  socket.onmessage = (event) => {
    console.log(`[WS] Message received: ${event.data}`);
    if (onMessageCallback) {
      onMessageCallback(JSON.parse(event.data));
    }
  };

  socket.onerror = (error) => {
    console.error('[WS] WebSocket error:', error);
  };

  socket.onclose = () => {
    console.warn('[WS] WebSocket disconnected');
  };

  // Provide send method too
  function send(data) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    }
  }

  return { socket, send };
}
