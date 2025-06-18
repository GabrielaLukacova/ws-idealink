export function connectToWS(boardID, onMessageCallback) {
  const socket = new WebSocket(`wss://ws-idealink.onrender.com/${boardID}`);

  socket.onopen = () => {
    console.log(`[WS] Connected to board: ${boardID}`);
  };

  socket.onmessage = async (event) => {
    try {
      let data;

      if (event.data instanceof Blob) {
        data = await event.data.text(); // Convert Blob to text
      } else {
        data = event.data;
      }

      console.log(`[WS] Message received: ${data}`);

      if (onMessageCallback) {
        onMessageCallback(JSON.parse(data));
      }
    } catch (e) {
      console.error('[WS] Failed to parse message:', e);
    }
  };

  socket.onerror = (error) => {
    console.error('[WS] WebSocket error:', error);
  };

  socket.onclose = () => {
    console.warn('[WS] WebSocket disconnected');
  };

  function send(data) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Socket not open, message not sent');
    }
  }

  return { socket, send };
}
