import React, { useState, memo, useEffect } from 'react';
import toast from 'react-hot-toast';
import { foldersAPI, tagsAPI } from '../../api/api';
import FolderForm from './FolderForm';
import TagForm from './TagForm';
import SidebarTabs from './SidebarTabs';
import './Sidebar.css';

const Sidebar = memo(({
  folders,
  tags,
  selectedFolder,
  selectedTags,
  onFolderSelect,
  onTagSelect,
  onFolderCreate,
  onTagCreate,
  onTemplateSelect,
  loading = false,
  user = null,
  onAuthRequired = null,
  isOpen = false,
  onClose = null,
}) => {
  const [activeTab, setActiveTab] = useState('folders');
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);

  const handleFolderCreate = async (folderData) => {
    // Проверяем авторизацию
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast.error('Войдите, чтобы создать папку');
      }
      setShowFolderForm(false);
      return;
    }

    try {
      console.log('Creating folder with data:', folderData);
      const response = await foldersAPI.create(folderData);
      console.log('Folder creation response:', response);
      
      // Проверяем успешный ответ
      if (response && (response.status === 201 || response.status === 200 || response.data)) {
        setShowFolderForm(false);
        toast.success('Папка успешно создана!');
        
        // Принудительно обновляем список папок
        if (onFolderCreate) {
          console.log('Calling onFolderCreate to refresh folders');
          await onFolderCreate();
        } else {
          console.warn('onFolderCreate callback is not provided');
        }
      } else {
        throw new Error('Неожиданный ответ от сервера');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 401) {
        if (onAuthRequired) {
          onAuthRequired();
        }
        setShowFolderForm(false);
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.detail || 
                            error.response?.data?.message ||
                            error.message || 
                            'Ошибка при создании папки. Попробуйте еще раз.';
        toast.error(errorMessage);
      }
    }
  };

  const handleTagCreate = async (tagData) => {
    // Проверяем авторизацию
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        toast.error('Войдите, чтобы создать тег');
      }
      setShowTagForm(false);
      return;
    }

    try {
      console.log('Creating tag with data:', tagData);
      const response = await tagsAPI.create(tagData);
      console.log('Tag creation response:', response);
      
      // Проверяем успешный ответ
      if (response && (response.status === 201 || response.status === 200 || response.data)) {
        setShowTagForm(false);
        toast.success('Тег успешно создан!');
        
        // Принудительно обновляем список тегов
        if (onTagCreate) {
          console.log('Calling onTagCreate to refresh tags');
          await onTagCreate();
        } else {
          console.warn('onTagCreate callback is not provided');
        }
      } else {
        throw new Error('Неожиданный ответ от сервера');
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 401) {
        if (onAuthRequired) {
          onAuthRequired();
        }
        setShowTagForm(false);
      } else {
        const errorMessage = error.response?.data?.error || 
                            error.response?.data?.detail || 
                            error.response?.data?.message ||
                            error.message || 
                            'Ошибка при создании тега. Попробуйте еще раз.';
        toast.error(errorMessage);
      }
    }
  };

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      onTagSelect(selectedTags.filter(id => id !== tagId));
    } else {
      onTagSelect([...selectedTags, tagId]);
    }
  };

  const handleContextMenu = (e, type, item) => {
    e.preventDefault();
    // TODO: Показать контекстное меню
    console.log('Context menu:', type, item);
  };

  const handleFolderDelete = async (folderId, e) => {
    e.stopPropagation();
    try {
      await foldersAPI.delete(folderId);
      toast.success('Папка удалена');
      if (onFolderCreate) {
        await onFolderCreate();
      }
      // Если удаленная папка была выбрана, сбрасываем выбор
      if (selectedFolder === folderId) {
        onFolderSelect(null);
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error(error.response?.data?.error || 'Ошибка при удалении папки');
    }
  };

  const handleTagDelete = async (tagId, e) => {
    e.stopPropagation();
    try {
      await tagsAPI.delete(tagId);
      toast.success('Тег удален');
      if (onTagCreate) {
        await onTagCreate();
      }
      // Убираем тег из выбранных, если он был выбран
      if (selectedTags.includes(tagId)) {
        onTagSelect(selectedTags.filter(id => id !== tagId));
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error(error.response?.data?.error || 'Ошибка при удалении тега');
    }
  };


  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>

      {!user && (
        <div className="sidebar-auth-message">
          <div className="auth-message-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="auth-message-text">
            Войдите, чтобы создавать папки, теги и использовать шаблоны
          </p>
          {onAuthRequired && (
            <button
              className="auth-message-btn"
              onClick={onAuthRequired}
            >
              Войти или Зарегистрироваться
            </button>
          )}
        </div>
      )}

      <SidebarTabs activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'folders' ? (
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                  <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Папки
              </h3>
              <button
                className="btn-add"
                onClick={() => {
                  if (!user && onAuthRequired) {
                    onAuthRequired();
                  } else {
                    setShowFolderForm(!showFolderForm);
                  }
                }}
                title={user ? "Создать папку" : "Войдите, чтобы создать папку"}
                disabled={!user}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {showFolderForm && (
              <FolderForm
                onSubmit={handleFolderCreate}
                onCancel={() => setShowFolderForm(false)}
              />
            )}
            {loading ? (
              <div className="loading-message">Загрузка...</div>
            ) : (
              <div className="folder-list">
                <button
                  className={`folder-item ${selectedFolder === null ? 'active' : ''}`}
                  onClick={() => onFolderSelect(null)}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M7 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Все заметки
                </button>
                {Array.isArray(folders) && folders.length > 0 ? (
                  folders.map(folder => (
                    <div
                      key={folder.id}
                      className={`folder-item-wrapper ${selectedFolder === folder.id ? 'active' : ''}`}
                      style={{ borderLeftColor: folder.color || '#90EE90' }}
                    >
                      <button
                        className={`folder-item ${selectedFolder === folder.id ? 'active' : ''}`}
                        onClick={() => onFolderSelect(folder.id)}
                        onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
                      >
                        {folder.is_favorite && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                          </svg>
                        )}
                        <span className="folder-name">{folder.name}</span>
                        <span className="folder-count">({folder.notes_count || 0})</span>
                      </button>
                      <button
                        className="folder-delete-btn"
                        onClick={(e) => handleFolderDelete(folder.id, e)}
                        title="Удалить папку"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">Нет папок. Создайте первую!</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
                  <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2.93 12.93C2.54371 12.5437 2.26852 12.0572 2.13389 11.527C1.99926 10.9968 2.01024 10.4447 2.16569 9.92196C2.32113 9.39924 2.61489 8.92677 3.01482 8.55685C3.41475 8.18692 3.90508 7.93361 4.42818 7.82578C4.95129 7.71796 5.48817 7.7593 5.99007 7.94505C6.49197 8.1308 6.93807 8.45473 7.28 8.88L8.34 10.34L15.66 3.02C16.0463 2.63371 16.5328 2.35852 17.063 2.22389C17.5932 2.08926 18.1453 2.10024 18.668 2.25569C19.1908 2.41113 19.6632 2.70489 20.0332 3.10482C20.4031 3.50475 20.6564 3.99508 20.7642 4.51818C20.872 5.04129 20.8307 5.57817 20.6449 6.08007C20.4592 6.58197 20.1353 7.02807 19.71 7.37L18.15 8.93L20.59 11.37C20.976 11.7567 21.2505 12.2428 21.3844 12.7727C21.5183 13.3026 21.5065 13.8544 21.3502 14.377C21.1939 14.8996 20.8993 15.3718 20.4986 15.7414C20.0979 16.111 19.6069 16.364 19.0833 16.4718C18.5597 16.5796 18.0225 16.5381 17.5204 16.3522C17.0183 16.1663 16.5721 15.8422 16.23 15.42L13.79 12.98L12.23 14.54L13.41 15.72C13.596 15.906 13.7435 16.1266 13.8441 16.3694C13.9448 16.6122 13.9966 16.8725 13.9966 17.1353C13.9966 17.3981 13.9448 17.6584 13.8441 17.9012C13.7435 18.144 13.596 18.3646 13.41 18.5506C13.224 18.7366 13.0034 18.8841 12.7606 18.9848C12.5178 19.0854 12.2575 19.1372 11.9947 19.1372C11.7319 19.1372 11.4716 19.0854 11.2288 18.9848C10.986 18.8841 10.7654 18.7366 10.5794 18.5506L2.93 10.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Теги
              </h3>
              <button
                className="btn-add"
                onClick={() => {
                  if (!user && onAuthRequired) {
                    onAuthRequired();
                  } else {
                    setShowTagForm(!showTagForm);
                  }
                }}
                title={user ? "Создать тег" : "Войдите, чтобы создать тег"}
                disabled={!user}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {showTagForm && (
              <TagForm
                onSubmit={handleTagCreate}
                onCancel={() => setShowTagForm(false)}
              />
            )}
            {loading ? (
              <div className="loading-message">Загрузка...</div>
            ) : (
              <div className="tag-list">
                {Array.isArray(tags) && tags.length > 0 ? (
                  tags
                    .sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))
                    .map(tag => (
                      <div
                        key={tag.id}
                        className="tag-item-wrapper"
                        style={{
                          backgroundColor: selectedTags.includes(tag.id) ? (tag.color || '#FFD700') : 'transparent',
                          borderColor: tag.color || '#FFD700',
                        }}
                      >
                        <button
                          className={`tag-item ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                          onClick={() => toggleTag(tag.id)}
                          onContextMenu={(e) => handleContextMenu(e, 'tag', tag)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: selectedTags.includes(tag.id) ? '#fff' : (tag.color || '#FFD700'),
                          }}
                        >
                          {tag.name}
                          {(tag.usage_count || tag.notes_count || 0) > 0 && (
                            <span className="tag-count">({tag.usage_count || tag.notes_count || 0})</span>
                          )}
                        </button>
                        <button
                          className="tag-delete-btn"
                          onClick={(e) => handleTagDelete(tag.id, e)}
                          title="Удалить тег"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </button>
                      </div>
                    ))
                ) : (
                  <div className="empty-message">Нет тегов. Создайте первый!</div>
                )}
              </div>
            )}
          </div>
        )}
      </SidebarTabs>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;


