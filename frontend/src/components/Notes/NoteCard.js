import React, { memo } from 'react';
import './NoteCard.css';

const PinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17V22M12 17C9.79086 17 8 15.2091 8 13C8 10.7909 9.79086 9 12 9C14.2091 9 16 10.7909 16 13C16 15.2091 14.2091 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const DeleteIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 11V17M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const NoteCard = memo(({ note, onEdit, onDelete, onPin }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Сегодня';
    if (diffDays === 2) return 'Вчера';
    if (diffDays <= 7) return `${diffDays - 1} дней назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const preview = stripHtml(note.content || '').substring(0, 150);

  return (
    <div className={`note-card ${note.is_pinned ? 'pinned' : ''}`}>
      <div className="note-card-header">
        <h3 className="note-title" onClick={() => onEdit(note)}>
          {note.is_pinned && (
            <span className="pin-icon">
              <PinIcon size={16} />
            </span>
          )}
          {note.title}
        </h3>
        <div className="note-actions">
          <button
            className="action-btn"
            onClick={() => onPin(note.id)}
            title={note.is_pinned ? 'Открепить' : 'Закрепить'}
          >
            <PinIcon size={18} />
          </button>
          <button
            className="action-btn delete"
            onClick={() => onDelete(note.id)}
            title="Удалить"
          >
            <DeleteIcon size={18} />
          </button>
        </div>
      </div>
      <div className="note-content" onClick={() => onEdit(note)}>
        {preview || 'Нет содержимого'}
      </div>
      {note.tags && note.tags.length > 0 && (
        <div className="note-tags">
          {note.tags.map(tag => {
            const tagColor = typeof tag === 'object' ? (tag.color || '#90EE90') : '#90EE90';
            const tagName = typeof tag === 'object' ? tag.name : tag;
            const tagId = typeof tag === 'object' ? tag.id : tag;
            return (
              <span
                key={tagId}
                className="note-tag"
                style={{ color: tagColor }}
              >
                {tagName}
              </span>
            );
          })}
        </div>
      )}
      <div className="note-footer">
        <span className="note-date">{formatDate(note.updated_at || note.created_at)}</span>
        {note.folder_name && (
          <span className="note-folder">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
              <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M7 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {note.folder_name}
          </span>
        )}
      </div>
    </div>
  );
});

NoteCard.displayName = 'NoteCard';

export default NoteCard;



