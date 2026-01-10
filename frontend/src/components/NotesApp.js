import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import Header from './Header/Header';
import Sidebar from './Sidebar/Sidebar';
import NotesGrid from './Notes/NotesGrid';
import NoteEditor from './Notes/NoteEditor';
import TemplateBuilder from './Templates/TemplateBuilder';
import DeleteModal from './Modal/DeleteModal';
import AuthModal from './Auth/AuthModal';
import { notesAPI, foldersAPI, tagsAPI } from '../api/api';
import './NotesApp.css';

const NotesApp = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null });
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingNoteData, setPendingNoteData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Debounce поискового запроса
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Не загружаем данные, пока не загружен пользователь
  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  // Автоматически открываем пустой редактор при первой загрузке (даже без авторизации)
  useEffect(() => {
    if (!authLoading && isInitialLoad && !showEditor && !showTemplateBuilder) {
      setShowEditor(true);
      setSelectedNote(null);
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isInitialLoad, showEditor, showTemplateBuilder]);

  useEffect(() => {
    if (!authLoading && user) {
      loadNotes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFolder, selectedTags, debouncedSearchQuery, authLoading, user]);

  const loadData = async () => {
    try {
      setError(null);
      console.log('Loading folders and tags...');
      const [foldersRes, tagsRes] = await Promise.all([
        foldersAPI.getAll(),
        tagsAPI.getAll(),
      ]);
      
      const foldersData = Array.isArray(foldersRes.data) ? foldersRes.data : 
                         (foldersRes.data?.results || []);
      const tagsData = Array.isArray(tagsRes.data) ? tagsRes.data : 
                      (tagsRes.data?.results || []);
      
      console.log('Loaded folders:', foldersData.length);
      console.log('Loaded tags:', tagsData.length);
      
      setFolders(foldersData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
      console.error('Error response:', error.response);
      setFolders([]);
      setTags([]);
      if (error.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
      } else {
        toast.error('Ошибка загрузки папок и тегов');
      }
    }
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (selectedFolder) params.folder = selectedFolder;
      if (selectedTags.length > 0) params.tags = selectedTags;
      if (debouncedSearchQuery) params.search = debouncedSearchQuery;
      
      const response = await notesAPI.getAll(params);
      const notesData = response.data.results || response.data || [];
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
      if (error.response?.status === 401) {
        setError('Сессия истекла. Пожалуйста, войдите снова.');
      } else {
        setError('Ошибка загрузки заметок. Попробуйте обновить страницу.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async (noteData = null) => {
    if (noteData) {
      // Если передан noteData (из шаблона), создаем заметку
      if (noteData.id && (noteData.name || noteData.template_name)) {
        // Это шаблон из Sidebar - открываем TemplateBuilder
        try {
          console.log('Opening template builder for:', noteData);
          // Устанавливаем шаблон для открытия в TemplateBuilder
          setSelectedTemplate(noteData);
          setShowTemplateBuilder(true);
          setShowEditor(false);
        } catch (error) {
          console.error('Error opening template builder:', error);
          toast.error('Ошибка при открытии шаблона');
        }
      } else if (noteData.formData || noteData.template) {
        // Это данные из TemplateBuilder
        try {
          const newNote = await notesAPI.create({
            title: noteData.title || 'Новая заметка',
            content: noteData.content || '',
            template: noteData.template
          });
          toast.success('Заметка создана из шаблона');
          await loadNotes();
          // Закрываем TemplateBuilder
          setShowTemplateBuilder(false);
          setSelectedTemplate(null);
          // Открываем созданную заметку в редакторе
          if (newNote && newNote.data) {
            setSelectedNote(newNote.data);
            setShowEditor(true);
          }
        } catch (error) {
          console.error('Error creating note from template:', error);
          toast.error(error.response?.data?.error || 'Ошибка при создании заметки из шаблона');
        }
      } else {
        // Это существующая заметка
        setSelectedNote(noteData);
        setShowEditor(true);
      }
    } else {
      // Создаем новую заметку
      setSelectedNote(null);
      setShowEditor(true);
    }
  };

  const handleEditNote = (note) => {
    setSelectedNote(note);
    setShowEditor(true);
  };

  const handleSaveNote = async (noteData, isFormData = false) => {
    // Если пользователь не авторизован, показываем модальное окно
    if (!user) {
      setPendingNoteData(noteData);
      setShowAuthModal(true);
      return;
    }

    try {
      let savedNote;
      if (selectedNote && selectedNote.id) {
        if (isFormData) {
          const response = await notesAPI.update(selectedNote.id, noteData, true);
          savedNote = response.data;
        } else {
          const response = await notesAPI.update(selectedNote.id, noteData);
          savedNote = response.data;
        }
        toast.success('Заметка обновлена');
        setSelectedNote(savedNote);
      } else {
        if (isFormData) {
          const response = await notesAPI.create(noteData, true);
          savedNote = response.data;
        } else {
          const response = await notesAPI.create(noteData);
          savedNote = response.data;
        }
        toast.success('Заметка создана');
        setSelectedNote(savedNote);
      }
      await loadNotes();
      // Не закрываем редактор после сохранения, чтобы можно было экспортировать
      return savedNote;
    } catch (error) {
      console.error('Error saving note:', error);
      if (error.response?.status === 401) {
        // Сессия истекла, показываем модальное окно
        setPendingNoteData(noteData);
        setShowAuthModal(true);
      } else {
        toast.error('Ошибка при сохранении заметки');
        throw error;
      }
    }
  };

  const handleAuthSuccess = async () => {
    // После успешной авторизации сохраняем отложенную заметку
    if (pendingNoteData) {
      try {
        const response = await notesAPI.create(pendingNoteData);
        toast.success('Заметка создана');
        await loadNotes();
        // Открываем созданную заметку в редакторе
        if (response && response.data) {
          setSelectedNote(response.data);
          setShowEditor(true);
        }
        setPendingNoteData(null);
      } catch (error) {
        console.error('Error saving note after auth:', error);
        toast.error('Ошибка при сохранении заметки');
        setPendingNoteData(null);
      }
    }
  };

  const handleDeleteNote = (noteId) => {
    setDeleteModal({ isOpen: true, noteId });
  };

  const confirmDelete = async () => {
    if (deleteModal.noteId) {
      try {
        await notesAPI.delete(deleteModal.noteId);
        await loadNotes();
        if (selectedNote?.id === deleteModal.noteId) {
          setShowEditor(false);
          setSelectedNote(null);
        }
        setDeleteModal({ isOpen: false, noteId: null });
      } catch (error) {
        console.error('Error deleting note:', error);
        setDeleteModal({ isOpen: false, noteId: null });
      }
    }
  };

  const handlePinNote = async (noteId) => {
    try {
      await notesAPI.pin(noteId);
      const note = notes.find(n => n.id === noteId);
      toast.success(note?.is_pinned ? 'Заметка откреплена' : 'Заметка закреплена');
      await loadNotes();
    } catch (error) {
      console.error('Error pinning note:', error);
      toast.error('Ошибка при изменении статуса заметки');
    }
  };

  // Клавиатурные сокращения
  useKeyboardShortcuts({
    'ctrl+n': (e) => {
      e.preventDefault();
      if (!showEditor) {
        handleCreateNote();
      }
    },
    'ctrl+k': (e) => {
      e.preventDefault();
      // Фокус на поиск
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    },
    'escape': () => {
      if (showEditor) {
        setShowEditor(false);
        setSelectedNote(null);
      }
      if (deleteModal.isOpen) {
        setDeleteModal({ isOpen: false, noteId: null });
      }
    },
  }, [showEditor, deleteModal, handleCreateNote]);

  // Показываем загрузку только если еще загружается аутентификация
  if (authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '17px',
        color: 'var(--text-secondary)',
        background: 'var(--bg-color)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        Загрузка...
      </div>
    );
  }

  return (
    <div className="notes-app">
      <Header
        user={user}
        onLogout={logout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreateNote={handleCreateNote}
        onTemplateSelect={(template) => {
          setSelectedTemplate(template);
          setShowTemplateBuilder(true);
          setShowEditor(false);
        }}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
        isSidebarOpen={isSidebarOpen}
        isSearchOpen={isSearchOpen}
      />
      <div className="notes-app-content">
        <Sidebar
          folders={user ? folders : []}
          tags={user ? tags : []}
          selectedFolder={selectedFolder}
          selectedTags={selectedTags}
          onFolderSelect={setSelectedFolder}
          onTagSelect={setSelectedTags}
          onFolderCreate={loadData}
          onTagCreate={loadData}
          onTemplateSelect={handleCreateNote}
          loading={loading && folders.length === 0}
          user={user}
          onAuthRequired={() => setShowAuthModal(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
        <div className="notes-main">
          {error && (
            <div className="error-banner">
              <span>{error}</span>
              <button onClick={() => { setError(null); loadNotes(); }}>Обновить</button>
            </div>
          )}
          {showTemplateBuilder && selectedTemplate ? (
            <TemplateBuilder
              template={selectedTemplate}
              onSave={handleCreateNote}
              onCancel={() => {
                setShowTemplateBuilder(false);
                setSelectedTemplate(null);
              }}
            />
          ) : showEditor ? (
            <NoteEditor
              note={selectedNote}
              folders={user ? folders : []}
              tags={user ? tags : []}
              onSave={handleSaveNote}
              onCancel={() => {
                setShowEditor(false);
                setSelectedNote(null);
              }}
            />
          ) : (
            <>
              {user ? (
                <NotesGrid
                  notes={notes}
                  loading={loading}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onPin={handlePinNote}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  color: 'var(--text-secondary)',
                  fontSize: '16px'
                }}>
                  Войдите, чтобы увидеть ваши заметки
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, noteId: null })}
        onConfirm={confirmDelete}
        title="Удаление заметки"
        message="Вы уверены, что хотите удалить эту заметку? Это действие нельзя отменить."
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setPendingNoteData(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default NotesApp;

