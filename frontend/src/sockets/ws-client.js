// Initializes a WebSocket connection for a given board ID
// Returns socket instance and a send function for emitting messages

export function connectToWS(boardID, onMessageCallback) {
  if (!boardID || typeof boardID !== 'string') {
    console.error('[WS] Invalid boardID passed to connectToWS:', boardID)
    throw new Error('BoardID must be a string')
  }

  const socket = new WebSocket(`wss://ws-idealink.onrender.com/${encodeURIComponent(boardID)}`)

  socket.onopen = () => {
    console.log(`[WS] Connected to board: ${boardID}`)
  }

  // Handles incoming messages from server
  socket.onmessage = async (event) => {
    try {
      const raw = event.data instanceof Blob ? await event.data.text() : event.data
      const data = JSON.parse(raw)
      onMessageCallback?.(data)
    } catch (err) {
      console.error('[WS] Failed to parse message:', err)
    }
  }

  socket.onerror = (err) => {
    console.error('[WS] WebSocket error:', err)
  }

  socket.onclose = () => {
    console.warn('[WS] WebSocket disconnected')
  }

  // Sends data if the socket is open
  function send(data) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data))
    } else {
      console.warn('[WS] Socket not open, message skipped', data)
    }
  }

  return { socket, send }
}
