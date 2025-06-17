export function connectToWS(boardID) {
    const socket = new WebSocket(`ws://localhost:3001/${boardID}`);
  
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
  
    socket.onmessage = (event) => {
      console.log('[WS] Incoming:', event.data);
      // Here you will call drawSync or addRemoteStickyNote later
    };
  
    socket.onerror = (err) => {
      console.error('WebSocket error:', err);
    };
  }
  
  export function connectToWS(boardID) {
    const socket = new WebSocket(`wss://your-backend.onrender.com/${boardID}`);
  }