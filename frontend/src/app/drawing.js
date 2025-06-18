// drawing.js
let ctx = null;
let isDrawing = false;
let isExternal = false;
let wsSend = null;

export function initDrawing(sendFunction) {
  wsSend = sendFunction;
}

// Call this when you want to set the canvas context, e.g., from your component
export function setContext(context) {
  ctx = context;
}

export function startDrawing(e) {
  if (!ctx) return;

  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);

  if (!isExternal && wsSend) {
    wsSend({ type: 'startDrawing', x: e.offsetX, y: e.offsetY });
  }
}

export function draw(e) {
  if (!ctx || !isDrawing) return;

  // Only draw local pointer if not external
  if (!isExternal) {
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    if (wsSend) {
      wsSend({ type: 'drawing', x: e.offsetX, y: e.offsetY });
    }
  }
}

export function stopDrawing() {
  if (!isDrawing) return;
  isDrawing = false;

  if (!isExternal && wsSend) {
    wsSend({ type: 'endDrawing' });
  }
}

// Called when you receive WS messages for remote drawing
export function handleExternalDrawing(message) {
  if (!ctx) return;

  switch (message.type) {
    case 'startDrawing':
      isExternal = true;
      ctx.beginPath();
      ctx.moveTo(message.x, message.y);
      break;

    case 'drawing':
      ctx.lineTo(message.x, message.y);
      ctx.stroke();
      break;

    case 'endDrawing':
      isExternal = false;
      break;
  }
}
