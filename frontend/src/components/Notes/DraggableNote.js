import React from 'react';
import './DraggableNote.css';

const DraggableNote = ({ note, onDragStart, onDragEnd, children }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', note.id.toString());
    if (onDragStart) {
      onDragStart(note, e);
    }
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(note, e);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="draggable-note"
    >
      {children}
    </div>
  );
};

export default DraggableNote;








