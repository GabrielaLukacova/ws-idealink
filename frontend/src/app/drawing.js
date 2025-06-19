// Canvas drawing logic for both local and external collaborative drawing via WebSocket

const ctx = null            // Canvas 2D context
const isDrawing = false     // Tracks local drawing state
const isExternal = false    // Prevents echoing external drawing back to WS
const wsSend = null         // Reference to WebSocket send function

/**
 * Initializes drawing module with WebSocket send function
 * @param {Function} sendFunction - Function to send drawing data to server
 */
export function initDrawing(sendFunction) {
  wsSend = sendFunction
}

/**
 * Assigns canvas rendering context
 * @param {CanvasRenderingContext2D} context - 2D canvas context
 */
export function setContext(context) {
  ctx = context
}

/**
 * Begins a drawing stroke
 */
export function startDrawing(e) {
  if (!ctx) return

  isDrawing = true
  ctx.beginPath()
  ctx.moveTo(e.offsetX, e.offsetY)

  if (!isExternal && wsSend) {
    wsSend({ type: 'startDrawing', x: e.offsetX, y: e.offsetY })
  }
}

/**
 * Draws a line segment and sends coordinates to WS
 */
export function draw(e) {
  if (!ctx || !isDrawing) return

  if (!isExternal) {
    ctx.lineTo(e.offsetX, e.offsetY)
    ctx.stroke()

    wsSend?.({ type: 'drawing', x: e.offsetX, y: e.offsetY })
  }
}

/**
 * Ends a drawing stroke and emits termination
 */
export function stopDrawing() {
  if (!isDrawing) return

  isDrawing = false

  if (!isExternal && wsSend) {
    wsSend({ type: 'endDrawing' })
  }
}

/**
 * Handles incoming WebSocket messages to render external drawing
 * @param {Object} message - drawing action from server
 */
export function handleExternalDrawing(message) {
  if (!ctx) return

  switch (message.type) {
    case 'startDrawing':
      isExternal = true
      ctx.beginPath()
      ctx.moveTo(message.x, message.y)
      break

    case 'drawing':
      ctx.lineTo(message.x, message.y)
      ctx.stroke()
      break

    case 'endDrawing':
      isExternal = false
      break
  }
}
