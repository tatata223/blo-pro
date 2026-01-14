import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const TagSelect = ({ tags, selectedTags, onTagSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const availableTags = tags.filter(tag => 
    !selectedTags.some(st => {
      const stId = typeof st === 'object' ? st.id : st;
      return stId === tag.id;
    })
  );

  const handleSelect = (tag) => {
    onTagSelect(tag);
    setIsOpen(false);
  };

  return (
    <div className="custom-select-wrapper">
      <label className="editor-sidebar-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.59 13.41L13.42 20.58C13.2343 20.766 13.0137 20.9135 12.7709 21.0141C12.5281 21.1148 12.2678 21.1666 12.005 21.1666C11.7422 21.1666 11.4819 21.1148 11.2391 21.0141C10.9963 20.9135 10.7757 20.766 10.59 20.58L2.93 12.93C2.54371 12.5437 2.26852 12.0572 2.13389 11.527C1.99926 10.9968 2.01024 10.4447 2.16569 9.92196C2.32113 9.39924 2.61489 8.92677 3.01482 8.55685C3.41475 8.18692 3.90508 7.93361 4.42818 7.82578C4.95129 7.71796 5.48817 7.7593 5.99007 7.94505C6.49197 8.1308 6.93807 8.45473 7.28 8.88L8.34 10.34L15.66 3.02C16.0463 2.63371 16.5328 2.35852 17.063 2.22389C17.5932 2.08926 18.1453 2.10024 18.668 2.25569C19.1908 2.41113 19.6632 2.70489 20.0332 3.10482C20.4031 3.50475 20.6564 3.99508 20.7642 4.51818C20.872 5.04129 20.8307 5.57817 20.6449 6.08007C20.4592 6.58197 20.1353 7.02807 19.71 7.37L18.15 8.93L20.59 11.37C20.976 11.7567 21.2505 12.2428 21.3844 12.7727C21.5183 13.3026 21.5065 13.8544 21.3502 14.377C21.1939 14.8996 20.8993 15.3718 20.4986 15.7414C20.0979 16.111 19.6069 16.364 19.0833 16.4718C18.5597 16.5796 18.0225 16.5381 17.5204 16.3522C17.0183 16.1663 16.5721 15.8422 16.23 15.42L13.79 12.98L12.23 14.54L13.41 15.72C13.596 15.906 13.7435 16.1266 13.8441 16.3694C13.9448 16.6122 13.9966 16.8725 13.9966 17.1353C13.9966 17.3981 13.9448 17.6584 13.8441 17.9012C13.7435 18.144 13.596 18.3646 13.41 18.5506C13.224 18.7366 13.0034 18.8841 12.7606 18.9848C12.5178 19.0854 12.2575 19.1372 11.9947 19.1372C11.7319 19.1372 11.4716 19.0854 11.2288 18.9848C10.986 18.8841 10.7654 18.7366 10.5794 18.5506L2.93 10.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Теги
      </label>
      <div className="custom-select" ref={selectRef}>
        <button
          className={`custom-select-button ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          disabled={availableTags.length === 0}
        >
          <span className="custom-select-value">
            {availableTags.length === 0 ? 'Все теги добавлены' : 'Выберите тег'}
          </span>
          <svg 
            className={`custom-select-arrow ${isOpen ? 'open' : ''}`}
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none"
          >
            <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {isOpen && availableTags.length > 0 && (
          <div className="custom-select-dropdown">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                className="custom-select-option"
                onClick={() => handleSelect(tag)}
                type="button"
                style={{ borderLeftColor: tag.color || '#90EE90' }}
              >
                <span style={{ color: tag.color || '#90EE90', marginRight: '8px' }}>●</span>
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelect;
