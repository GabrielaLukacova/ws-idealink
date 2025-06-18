// src/sockets/ws-client.js

/**
 * Establishes a WebSocket connection for a given boardID and
 * enables message sending and receiving through callbacks.
 */
export function connectToWS(boardID, onMessageCallback) {
  if (!boardID || typeof boardID !== 'string') {
    console.error('[WS] Invalid boardID passed to connectToWS:', boardID)
    throw new Error('❌ boardID must be a string – maybe you forgot .value?')
  }

  let socket
  const url = `wss://ws-idealink.onrender.com/${encodeURIComponent(boardID)}`

  try {
    socket = new WebSocket(url)
  } catch (err) {
    console.error('[WS] Failed to create WebSocket:', err)
    return { socket: null, send: () => {} }
  }

  socket.onopen = () => {
    console.log(`[WS] ✅ Connected to board: ${boardID}`)
    // Request sync state on join
    socket.send(JSON.stringify({ type: 'requestSync', boardId: boardID }))
  }

  socket.onmessage = async (event) => {
    try {
      const text = event.data instanceof Blob ? await event.data.text() : event.data
      const data = JSON.parse(text)
      console.log('[WS] ✉️ Message received:', data)
      onMessageCallback?.(data)
    } catch (err) {
      console.error('[WS] ❌ Failed to parse message:', err)
    }
  }

  socket.onerror = (error) => {
    console.error('[WS] ⚡️ WebSocket error:', error)
  }

  socket.onclose = () => {
    console.warn('[WS] ❌ WebSocket disconnected')
  }

  function send(data) {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data))
    } else {
      console.warn('[WS] ❌ Socket not open, message not sent', data)
    }
  }

  return { socket, send }
}