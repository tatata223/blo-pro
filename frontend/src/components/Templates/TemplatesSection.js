import React, { useState, useEffect } from 'react';
import { templatesAPI } from '../../api/api';
import TemplatePreview from './TemplatePreview';
import TemplateBuilder from './TemplateBuilder';
import './TemplatesSection.css';

const TemplatesSection = ({ onTemplateSelect }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [builderTemplate, setBuilderTemplate] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templatesAPI.getAll();
      console.log('Templates response:', response);
      const templatesData = Array.isArray(response.data) ? response.data : 
                           (response.data?.results || []);
      setTemplates(templatesData);
      if (templatesData.length === 0) {
        console.warn('No templates found. Make sure templates are initialized.');
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      console.error('Error details:', error.response?.data);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateClick = (template) => {
    // Показываем предпросмотр
    setPreviewTemplate(template);
  };

  const handleUseTemplate = () => {
    if (previewTemplate) {
      setBuilderTemplate(previewTemplate);
      setPreviewTemplate(null);
    }
  };

  const handleSaveFromBuilder = (noteData) => {
    // Передаем данные в родительский компонент
    onTemplateSelect(noteData);
    setBuilderTemplate(null);
  };

  const handleCancelBuilder = () => {
    setBuilderTemplate(null);
  };

  // Если открыт билдер, показываем его
  if (builderTemplate) {
    return (
      <section className="templates-section">
        <TemplateBuilder
          template={builderTemplate}
          onSave={handleSaveFromBuilder}
          onCancel={handleCancelBuilder}
        />
      </section>
    );
  }

  if (loading) {
    return (
      <section className="templates-section">
        <div className="templates-loading">Загрузка шаблонов...</div>
      </section>
    );
  }

  if (!Array.isArray(templates) || templates.length === 0) {
    return (
      <section className="templates-section">
        <h2 className="templates-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
            <rect x="3" y="5" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M3 9H21M7 5V9M17 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Шаблоны заметок
        </h2>
        <div className="templates-empty">
          <p>Шаблоны не найдены. Обратитесь к администратору для инициализации шаблонов.</p>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="templates-section">
        <h2 className="templates-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
            <rect x="3" y="5" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M3 9H21M7 5V9M17 5V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Шаблоны заметок
        </h2>
        <div className="templates-grid">
          {templates.map(template => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => handleTemplateClick(template)}
            >
              <div className="template-icon" dangerouslySetInnerHTML={{ __html: template.icon_svg }} />
              <h3 className="template-name">{template.name}</h3>
              {template.category && (
                <span className="template-category-badge">{template.category}</span>
              )}
              {template.description && (
                <p className="template-description">{template.description}</p>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          onUse={handleUseTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}
    </>
  );
};

export default TemplatesSection;

