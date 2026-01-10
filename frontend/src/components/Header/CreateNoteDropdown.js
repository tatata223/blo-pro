import React, { useState, useEffect, useRef } from 'react';
import { templatesAPI } from '../../api/api';
import './CreateNoteDropdown.css';

const CreateNoteDropdown = ({ isOpen, onClose, onCreateNote, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      // Закрываем при клике вне меню
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templatesAPI.getAll();
      const templatesData = Array.isArray(response.data) ? response.data : 
                           (response.data?.results || []);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewNote = () => {
    onCreateNote();
    onClose();
  };

  const handleTemplateSelect = (template) => {
    onSelectTemplate(template);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="create-note-dropdown" ref={dropdownRef}>
      <div className="dropdown-content">
        <button 
          className="dropdown-item new-note-item"
          onClick={handleNewNote}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          <span>Новая</span>
        </button>
        {templates.length > 0 && (
          <>
            <div className="dropdown-divider"></div>
            <div className="templates-section">
              <div className="templates-label">Шаблоны</div>
          {loading ? (
            <div className="templates-loading">Загрузка...</div>
          ) : templates.length === 0 ? (
            <div className="templates-empty">Нет доступных шаблонов</div>
          ) : (
            <div className="templates-list">
              {templates.map(template => (
                <button
                  key={template.id}
                  className="dropdown-item template-item"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div 
                    className="template-icon-small"
                    dangerouslySetInnerHTML={{ __html: template.icon_svg || '' }}
                  />
                  <div className="template-info">
                    <span className="template-name-small">{template.name}</span>
                    {template.category && (
                      <span className="template-category-small">{template.category}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateNoteDropdown;


