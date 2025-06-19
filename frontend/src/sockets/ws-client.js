export function connectToWS(boardID, onMessageCallback) {
  if (!boardID || typeof boardID !== 'string') {
    console.error('[WS] Invalid boardID passed to connectToWS:', boardID)
    throw new Error('❌ boardID must be a string – maybe you forgot .value?')
  }

  const socket = new WebSocket(`wss://ws-idealink.onrender.com/${encodeURIComponent(boardID)}`);

  socket.onopen = () => {
    console.log(`[WS] ✅ Connected to board: ${boardID}`);
  };

  socket.onmessage = async (event) => {
    try {
      let data;
      if (event.data instanceof Blob) {
        data = await event.data.text();
      } else {
        data = event.data;
      }

      console.log('[WS] 📩 Message received:', data);

      if (onMessageCallback) {
        onMessageCallback(JSON.parse(data));
      }
    } catch (e) {
      console.error('[WS] ❌ Failed to parse message:', e);
    }
  };

  socket.onerror = (error) => {
    console.error('[WS] ⚡️ WebSocket error:', error);
  };

  socket.onclose = () => {
    console.warn('[WS] ❌ WebSocket disconnected');
  };

  function send(data) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data));
    } else {
      console.warn('[WS] Socket not open, message not sent', data);
    }
  }

  return { socket, send };
}
