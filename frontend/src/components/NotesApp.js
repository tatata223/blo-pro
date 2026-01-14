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

  // Guest mode helpers
  const getGuestNotes = () => {
    try {
      const stored = localStorage.getItem('guest_notes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const getGuestFolders = () => {
    try {
      const stored = localStorage.getItem('guest_folders');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const getGuestTags = () => {
    try {
      const stored = localStorage.getItem('guest_tags');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const saveGuestNote = (note) => {
    const guestNotes = getGuestNotes();
    if (guestNotes.length >= 1 && !note.id) {
      toast.error('Для создания больше заметок необходимо зарегистрироваться');
      setShowAuthModal(true);
      return false;
    }
    const updatedNotes = note.id 
      ? guestNotes.map(n => n.id === note.id ? { ...note, id: note.id } : n)
      : [...guestNotes, { ...note, id: `guest_${Date.now()}` }];
    localStorage.setItem('guest_notes', JSON.stringify(updatedNotes));
    return true;
  };

  const saveGuestFolder = (folder) => {
    const guestFolders = getGuestFolders();
    if (guestFolders.length >= 1 && !folder.id) {
      toast.error('Для создания больше папок необходимо зарегистрироваться');
      setShowAuthModal(true);
      return false;
    }
    const updatedFolders = folder.id
      ? guestFolders.map(f => f.id === folder.id ? folder : f)
      : [...guestFolders, { ...folder, id: `guest_${Date.now()}` }];
    localStorage.setItem('guest_folders', JSON.stringify(updatedFolders));
    return true;
  };

  const saveGuestTag = (tag) => {
    const guestTags = getGuestTags();
    if (guestTags.length >= 1 && !tag.id) {
      toast.error('Для создания больше тегов необходимо зарегистрироваться');
      setShowAuthModal(true);
      return false;
    }
    const updatedTags = tag.id
      ? guestTags.map(t => t.id === tag.id ? tag : t)
      : [...guestTags, { ...tag, id: `guest_${Date.now()}` }];
    localStorage.setItem('guest_tags', JSON.stringify(updatedTags));
    return true;
  };

  const transferGuestData = async () => {
    const guestNotes = getGuestNotes();
    const guestFolders = getGuestFolders();
    const guestTags = getGuestTags();
    
    try {
      // Transfer folders
      for (const folder of guestFolders) {
        try {
          await foldersAPI.create({ name: folder.name, color: folder.color });
        } catch (error) {
          console.error('Error transferring folder:', error);
        }
      }
      
      // Transfer tags
      for (const tag of guestTags) {
        try {
          await tagsAPI.create({ name: tag.name, color: tag.color });
        } catch (error) {
          console.error('Error transferring tag:', error);
        }
      }
      
      // Transfer notes
      for (const note of guestNotes) {
        try {
          await notesAPI.create({
            title: note.title,
            content: note.content,
            folder: note.folder
          });
        } catch (error) {
          console.error('Error transferring note:', error);
        }
      }
      
      // Clear guest data
      localStorage.removeItem('guest_notes');
      localStorage.removeItem('guest_folders');
      localStorage.removeItem('guest_tags');
    } catch (error) {
      console.error('Error transferring guest data:', error);
    }
  };

  // Загружаем данные для авторизованных пользователей или гостевые данные
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadData();
      } else {
        // Загружаем гостевые данные
        const guestNotes = getGuestNotes();
        const guestFolders = getGuestFolders();
        const guestTags = getGuestTags();
        setNotes(guestNotes);
        setFolders(guestFolders);
        setTags(guestTags);
        setLoading(false);
      }
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
    if (!authLoading) {
      if (user) {
        // Проверяем, не является ли selectedFolder guest ID
        const isGuestFolder = selectedFolder && typeof selectedFolder === 'string' && selectedFolder.startsWith('guest_');
        if (!isGuestFolder) {
          loadNotes();
        } else {
          // Фильтруем гостевые заметки локально
          const guestNotes = getGuestNotes();
          let filteredNotes = guestNotes;
          
          if (selectedFolder) {
            filteredNotes = filteredNotes.filter(note => {
              const noteFolderId = typeof note.folder === 'object' && note.folder !== null
                ? note.folder.id
                : note.folder || null;
              return noteFolderId === selectedFolder;
            });
          }
          
          if (selectedTags.length > 0) {
            filteredNotes = filteredNotes.filter(note => {
              const noteTags = Array.isArray(note.tags) 
                ? note.tags.map(t => typeof t === 'object' ? t.id : t)
                : [];
              return selectedTags.some(tagId => noteTags.includes(tagId));
            });
          }
          
          if (debouncedSearchQuery) {
            const query = debouncedSearchQuery.toLowerCase();
            filteredNotes = filteredNotes.filter(note => 
              (note.title || '').toLowerCase().includes(query) ||
              (note.content || '').toLowerCase().includes(query)
            );
          }
          
          setNotes(filteredNotes);
          setLoading(false);
        }
      } else {
        // Для гостей фильтруем локально
        const guestNotes = getGuestNotes();
        let filteredNotes = guestNotes;
        
        if (selectedFolder) {
          filteredNotes = filteredNotes.filter(note => {
            const noteFolderId = typeof note.folder === 'object' && note.folder !== null
              ? note.folder.id
              : note.folder || null;
            return noteFolderId === selectedFolder;
          });
        }
        
        if (selectedTags.length > 0) {
          filteredNotes = filteredNotes.filter(note => {
            const noteTags = Array.isArray(note.tags) 
              ? note.tags.map(t => typeof t === 'object' ? t.id : t)
              : [];
            return selectedTags.some(tagId => noteTags.includes(tagId));
          });
        }
        
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredNotes = filteredNotes.filter(note => 
            (note.title || '').toLowerCase().includes(query) ||
            (note.content || '').toLowerCase().includes(query)
          );
        }
        
        setNotes(filteredNotes);
        setLoading(false);
      }
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
      
      // Проверяем, не является ли selectedFolder guest ID
      const isGuestFolder = selectedFolder && typeof selectedFolder === 'string' && selectedFolder.startsWith('guest_');
      if (isGuestFolder) {
        // Фильтруем гостевые заметки локально
        const guestNotes = getGuestNotes();
        let filteredNotes = guestNotes.filter(note => {
          const noteFolderId = typeof note.folder === 'object' && note.folder !== null
            ? note.folder.id
            : note.folder || null;
          return noteFolderId === selectedFolder;
        });
        
        if (selectedTags.length > 0) {
          filteredNotes = filteredNotes.filter(note => {
            const noteTags = Array.isArray(note.tags) 
              ? note.tags.map(t => typeof t === 'object' ? t.id : t)
              : [];
            return selectedTags.some(tagId => noteTags.includes(tagId));
          });
        }
        
        if (debouncedSearchQuery) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredNotes = filteredNotes.filter(note => 
            (note.title || '').toLowerCase().includes(query) ||
            (note.content || '').toLowerCase().includes(query)
          );
        }
        
        setNotes(filteredNotes);
        setLoading(false);
        return;
      }
      
      const params = {};
      // Отправляем только числовые ID папок
      if (selectedFolder && !isGuestFolder) {
        params.folder = selectedFolder;
      }
      if (selectedTags.length > 0) {
        // Фильтруем guest теги
        const numericTagIds = selectedTags.filter(tagId => 
          typeof tagId === 'number' || (typeof tagId === 'string' && !tagId.startsWith('guest_'))
        );
        if (numericTagIds.length > 0) {
          params.tags = numericTagIds;
        }
      }
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
    // Если пользователь не авторизован, сохраняем в guest mode
    if (!user) {
      const guestNote = {
        title: noteData.title || 'Без названия',
        content: noteData.content || '',
        folder: noteData.folder || null,
        tags: noteData.tags || [],
        id: selectedNote?.id || null
      };
      if (saveGuestNote(guestNote)) {
        const guestNotes = getGuestNotes();
        const savedNote = guestNote.id 
          ? guestNotes.find(n => n.id === guestNote.id) || guestNote
          : guestNotes[guestNotes.length - 1];
        setSelectedNote(savedNote);
        toast.success('Заметка сохранена (гостевой режим)');
        return savedNote;
      }
      return null;
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
    // После успешной авторизации переносим гостевые данные
    await transferGuestData();
    await loadData();
    await loadNotes();
    
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
        onAuthRequired={() => setShowAuthModal(true)}
      />
      <div className="notes-app-content">
        <Sidebar
          folders={user ? folders : getGuestFolders()}
          tags={user ? tags : getGuestTags()}
          selectedFolder={selectedFolder}
          selectedTags={selectedTags}
          onFolderSelect={setSelectedFolder}
          onTagSelect={setSelectedTags}
          onFolderCreate={async (folderData) => {
            if (!user) {
              if (saveGuestFolder(folderData)) {
                const guestFolders = getGuestFolders();
                setFolders(guestFolders);
                toast.success('Папка создана (гостевой режим)');
              }
            } else {
              await loadData();
            }
          }}
          onTagCreate={async (tagData) => {
            if (!user) {
              if (saveGuestTag(tagData)) {
                const guestTags = getGuestTags();
                setTags(guestTags);
                toast.success('Тег создан (гостевой режим)');
              }
            } else {
              await loadData();
            }
          }}
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
              <NotesGrid
                notes={user ? notes : getGuestNotes()}
                loading={loading}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
                onPin={handlePinNote}
              />
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

