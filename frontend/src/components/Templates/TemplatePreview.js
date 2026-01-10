import React from 'react';
import './TemplatePreview.css';

const TemplatePreview = ({ template, onUse, onClose }) => {
  if (!template) return null;

  const fields = template.template_data || [];
  const tags = template.tags || [];

  return (
    <div className="template-preview-overlay" onClick={onClose}>
      <div className="template-preview-content" onClick={(e) => e.stopPropagation()}>
        <div className="template-preview-header">
          <div className="template-preview-icon" dangerouslySetInnerHTML={{ __html: template.icon_svg }} />
          <div>
            <h2>{template.name}</h2>
            {template.category && (
              <span className="template-category">{template.category}</span>
            )}
          </div>
          <button className="template-preview-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {template.description && (
          <p className="template-preview-description">{template.description}</p>
        )}

        {tags.length > 0 && (
          <div className="template-preview-tags">
            {tags.map((tag, idx) => (
              <span key={idx} className="template-tag">{tag}</span>
            ))}
          </div>
        )}

        {fields.length > 0 && (
          <div className="template-preview-fields">
            <h3>Поля шаблона:</h3>
            <div className="fields-list">
              {fields.map((field, idx) => (
                <div key={idx} className="field-preview">
                  <div className="field-preview-header">
                    <span className="field-name">{field.label}</span>
                    <div className="field-badges">
                      {field.required && <span className="badge-required">Обязательно</span>}
                      <span className="badge-type">{field.type}</span>
                    </div>
                  </div>
                  {field.placeholder && (
                    <p className="field-placeholder">{field.placeholder}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="template-preview-actions">
          <button onClick={onClose} className="btn-preview-cancel">
            Отмена
          </button>
          <button onClick={onUse} className="btn-preview-use">
            Использовать шаблон
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatePreview;








