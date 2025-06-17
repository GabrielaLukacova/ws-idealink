let isDrawingEnabled = false;
let isDrawing = false;
let ctx = null;
let canvas = null;
let isExternal = false;

export function toggleDrawingMode() {
  canvas = document.getElementById('drawingCanvas');
  ctx = canvas?.getContext('2d');

  if (!canvas || !ctx) return;

  const button = document.getElementById('startDrawingBtn');

  if (!isDrawingEnabled) {
    enableDrawing();
    if (button) button.textContent = "Stop Drawing";
  } else {
    disableDrawing();
    if (button) button.textContent = "Start Drawing";
  }
}

function enableDrawing() {
  isDrawingEnabled = true;
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);
}

function disableDrawing() {
  isDrawingEnabled = false;
  canvas.removeEventListener('mousedown', startDrawing);
  canvas.removeEventListener('mousemove', draw);
  canvas.removeEventListener('mouseup', stopDrawing);
  canvas.removeEventListener('mouseleave', stopDrawing);
}

function startDrawing(e) {
  if (!ctx) return;
  isDrawing = true;
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function draw(e) {
  if (!ctx || !isDrawing || isExternal) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

export function setExternalDrawing(value) {
  isExternal = value;
}

export function getCanvas() {
  return canvas;
}

export function getContext() {
  return ctx;
}
