import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { notesAPI, tagsAPI } from '../../api/api';
import RichTextEditor from './RichTextEditor';
import ExportModal from '../Export/ExportModal';
import CustomSelect from './CustomSelect';
import TagSelect from './TagSelect';
import './NoteEditor.css';

const NoteEditor = ({ note, folders, tags, onSave, onCancel }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [selectedFolder, setSelectedFolder] = useState(note?.folder || null);
  const [selectedTags, setSelectedTags] = useState(note?.tags || []);
  const [saving, setSaving] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(note);
  const autoSaveTimerRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      // Обрабатываем folder: может быть id или объект с id
      const folderId = typeof note.folder === 'object' && note.folder !== null 
        ? note.folder.id 
        : note.folder || null;
      setSelectedFolder(folderId);
      // Обрабатываем tags: может быть массив объектов или массив id
      const tagsArray = Array.isArray(note.tags) 
        ? note.tags.map(tag => typeof tag === 'object' ? tag : { id: tag })
        : [];
      setSelectedTags(tagsArray);
      setCurrentNote(note);
    } else {
      setSelectedFolder(null);
      setSelectedTags([]);
      setCurrentNote(null);
    }
  }, [note]);

  const handleAutoSave = useCallback(async () => {
    if (!title.trim() && !content.trim()) return;
    
    try {
      const savedNote = await onSave({
        title: title.trim() || 'Без названия',
        content: content,
        folder: selectedFolder,
        tags: selectedTags.map(tag => typeof tag === 'object' ? tag.id : tag),
      });
      if (savedNote && savedNote.id) {
        setCurrentNote(savedNote);
      }
    } catch (error) {
      console.error('Error auto-saving note:', error);
    }
  }, [title, content, selectedFolder, selectedTags, onSave]);

  // Автосохранение каждые 30 секунд (только для сохраненных заметок)
  useEffect(() => {
    if (autoSaveTimerRef.current) {
      clearInterval(autoSaveTimerRef.current);
    }

    if (content && title && currentNote && currentNote.id) {
      autoSaveTimerRef.current = setInterval(() => {
        handleAutoSave();
      }, 30000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
      }
    };
  }, [content, title, currentNote, handleAutoSave]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const savedNote = await onSave({
        title: title.trim() || 'Без названия',
        content: content,
        folder: selectedFolder,
        tags: selectedTags.map(tag => typeof tag === 'object' ? tag.id : tag),
      });
      if (savedNote && savedNote.id) {
        setCurrentNote(savedNote);
      }
      toast.success('Заметка сохранена');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Ошибка при сохранении заметки');
    } finally {
      setSaving(false);
    }
  }, [title, content, selectedFolder, selectedTags, onSave]);

  const handleTagSelect = useCallback(async (tag) => {
    if (tag.isNew) {
      // Создаем новый тег
      try {
        const response = await tagsAPI.create({ name: tag.name });
        const newTag = response.data;
        setSelectedTags(prev => [...prev, newTag]);
      } catch (error) {
        console.error('Error creating tag:', error);
        toast.error('Ошибка при создании тега');
      }
    } else {
      // Добавляем существующий тег
      setSelectedTags(prev => {
        if (prev.some(t => (typeof t === 'object' ? t.id : t) === tag.id)) {
          return prev;
        }
        return [...prev, tag];
      });
    }
  }, []);

  const handleTagRemove = useCallback((tagId) => {
    setSelectedTags(prev => prev.filter(tag => (typeof tag === 'object' ? tag.id : tag) !== tagId));
  }, []);


  // Клавиатурные сокращения для редактора
  useKeyboardShortcuts({
    'ctrl+s': (e) => {
      e.preventDefault();
      handleSave();
    },
    'escape': () => {
      onCancel();
    },
  }, [handleSave, onCancel]);

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          className="editor-title"
          placeholder="Заголовок заметки"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="editor-actions">
          <button 
            className="btn-home" 
            onClick={() => {
              onCancel();
              navigate('/', { replace: false });
            }} 
            title="Вернуться домой"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {currentNote && currentNote.id && (
            <button 
              className="btn-export" 
              onClick={() => setShowExportModal(true)} 
              title="Экспорт"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
          <button className="btn-save" onClick={handleSave} disabled={saving} title="Сохранить">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#22C55E" fillOpacity="0.1"/>
            </svg>
          </button>
          <button className="btn-cancel" onClick={onCancel} title="Не сохранять">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#EF4444" fillOpacity="0.1"/>
            </svg>
          </button>
        </div>
      </div>

      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder=""
        autoFocus={!note}
      />

      <div className="editor-sidebar editor-sidebar-bottom">
        <div className="editor-sidebar-section">
          <CustomSelect
            value={selectedFolder || ''}
            onChange={(value) => {
              const folderId = value ? parseInt(value) : null;
              setSelectedFolder(folderId);
              
              if (currentNote && currentNote.id) {
                const currentFolderId = typeof currentNote.folder === 'object' && currentNote.folder !== null
                  ? currentNote.folder.id
                  : currentNote.folder || null;
                
                if (folderId !== currentFolderId) {
                  notesAPI.moveToFolder(currentNote.id, folderId)
                    .then(() => toast.success('Заметка перемещена в папку'))
                    .catch(error => {
                      console.error('Error moving note to folder:', error);
                      toast.error('Ошибка при перемещении в папку');
                    });
                }
              }
            }}
            options={[
              { value: '', label: 'Без папки' },
              ...folders.map(folder => ({ value: folder.id.toString(), label: folder.name }))
            ]}
            placeholder="Без папки"
            label="Папка"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H9L11 5H20C20.5304 5 21.0391 5.21071 21.4142 5.58579C21.7893 5.96086 22 6.46957 22 7V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />
        </div>

        <div className="editor-sidebar-section">
          <TagSelect
            tags={tags}
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
          />
          {selectedTags.length > 0 && (
            <div className="editor-selected-tags">
              {selectedTags.map(tag => {
                const tagId = typeof tag === 'object' ? tag.id : tag;
                const tagName = typeof tag === 'object' ? tag.name : tags.find(t => t.id === tagId)?.name || '';
                const tagColor = typeof tag === 'object' ? (tag.color || '#90EE90') : (tags.find(t => t.id === tagId)?.color || '#90EE90');
                return (
                  <span key={tagId} className="editor-tag-item" style={{ color: tagColor }}>
                    {tagName}
                    <button
                      type="button"
                      className="editor-tag-remove"
                      onClick={() => handleTagRemove(tagId)}
                      title="Удалить тег"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {showExportModal && currentNote && (
        <ExportModal
          note={currentNote}
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default NoteEditor;

