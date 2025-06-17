export function addStickyNote() {
    const stickyNotesContainer = document.getElementById('stickyNotes');
  
    const stickyNote = document.createElement('div');
    stickyNote.classList.add('sticky-note');
  
    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Write your note here...';
  
    stickyNote.appendChild(textarea);
    stickyNotesContainer.appendChild(stickyNote);
  
    makeStickyNoteDraggable(stickyNote);
  }
  
  function makeStickyNoteDraggable(stickyNote) {
    let offsetX, offsetY, isDragging = false;
  
    stickyNote.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - stickyNote.getBoundingClientRect().left;
      offsetY = e.clientY - stickyNote.getBoundingClientRect().top;
      stickyNote.style.cursor = 'grabbing';
    });
  
    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        stickyNote.style.position = 'absolute';
        stickyNote.style.left = `${e.clientX - offsetX}px`;
        stickyNote.style.top = `${e.clientY - offsetY}px`;
      }
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
      stickyNote.style.cursor = 'grab';
    });
  }
  