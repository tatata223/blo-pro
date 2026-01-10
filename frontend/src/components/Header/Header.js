import React, { memo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import UserDropdown from './UserDropdown';
import CreateNoteDropdown from './CreateNoteDropdown';
import './Header.css';

const Header = memo(({ searchQuery, onSearchChange, onCreateNote, onSidebarToggle, onSearchToggle, isSidebarOpen, isSearchOpen, onTemplateSelect }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isCreateDropdownOpen, setIsCreateDropdownOpen] = useState(false);
  const createButtonRef = useRef(null);
  const searchContainerRef = useRef(null);

  const handleCreateClick = () => {
    setIsCreateDropdownOpen(!isCreateDropdownOpen);
  };

  const handleNewNote = () => {
    onCreateNote();
  };

  const handleTemplateSelect = (template) => {
    if (onTemplateSelect) {
      onTemplateSelect(template);
    }
  };

  // Автоскрытие поисковой панели при потере фокуса и уходе курсора
  useEffect(() => {
    if (isSearchOpen && searchContainerRef.current) {
      let hideTimeout = null;

      const handleMouseLeave = () => {
        // Небольшая задержка перед скрытием
        hideTimeout = setTimeout(() => {
          if (searchContainerRef.current && !searchContainerRef.current.matches(':hover')) {
            const searchInput = searchContainerRef.current.querySelector('.search-input-center');
            // Не скрываем, если поле ввода имеет фокус
            if (searchInput !== document.activeElement) {
              onSearchToggle();
            }
          }
        }, 300);
      };

      const handleMouseEnter = () => {
        // Отменяем скрытие, если курсор вернулся
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      };

      const handleBlur = (e) => {
        // Если фокус ушел с поисковой панели
        setTimeout(() => {
          if (!searchContainerRef.current?.contains(document.activeElement)) {
            // Проверяем, что курсор не на панели
            if (!searchContainerRef.current?.matches(':hover')) {
              onSearchToggle();
            }
          }
        }, 150);
      };

      const searchInput = searchContainerRef.current.querySelector('.search-input-center');
      
      searchContainerRef.current.addEventListener('mouseleave', handleMouseLeave);
      searchContainerRef.current.addEventListener('mouseenter', handleMouseEnter);
      if (searchInput) {
        searchInput.addEventListener('blur', handleBlur);
      }

      return () => {
        if (hideTimeout) clearTimeout(hideTimeout);
        searchContainerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
        searchContainerRef.current?.removeEventListener('mouseenter', handleMouseEnter);
        searchInput?.removeEventListener('blur', handleBlur);
      };
    }
  }, [isSearchOpen, onSearchToggle]);

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <button
            className="btn-burger"
            onClick={onSidebarToggle}
            title="Меню"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <button
            className="app-title-btn"
            onClick={() => navigate('/', { replace: false })}
            title="Перейти на главную страницу"
          >
            <svg className="app-logo" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="app-title-text">BlocknotPRO</span>
          </button>
        </div>
        <div className={`header-center ${isSearchOpen ? 'search-open' : ''}`}>
          {isSearchOpen && (
            <div className="search-container-center" ref={searchContainerRef}>
              <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                className="search-input-center"
                placeholder="Поиск заметок..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
              />
              <button
                className="search-close-btn"
                onClick={onSearchToggle}
                title="Закрыть поиск"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="header-right">
          <button
            className="btn-search-toggle"
            onClick={onSearchToggle}
            title="Поиск"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="create-note-wrapper" ref={createButtonRef}>
            <button
              className="btn-create-note"
              onClick={handleCreateClick}
              title="Создать"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
            <CreateNoteDropdown
              isOpen={isCreateDropdownOpen}
              onClose={() => setIsCreateDropdownOpen(false)}
              onCreateNote={handleNewNote}
              onSelectTemplate={handleTemplateSelect}
            />
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
          >
            {theme === 'light' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            )}
          </button>
          <UserDropdown
            user={user}
            onLogout={logout}
            onCreateNote={onCreateNote}
          />
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;


