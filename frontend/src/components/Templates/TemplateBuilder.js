import React, { useState } from 'react';
import './TemplateBuilder.css';

const TemplateBuilder = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Получаем поля из template_data
  // template_data может быть объектом с полем 'fields' или массивом
  let fields = [];
  if (template?.template_data) {
    if (Array.isArray(template.template_data)) {
      fields = template.template_data;
    } else if (template.template_data.fields && Array.isArray(template.template_data.fields)) {
      fields = template.template_data.fields;
    }
  }

  const handleChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    // Очищаем ошибку при изменении
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateField = (field, value) => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} обязателен для заполнения`;
    }
    if (field.type === 'number' && value && isNaN(value)) {
      return `${field.label} должен быть числом`;
    }
    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Генерируем HTML контент из заполненных данных
      const htmlContent = generateHTMLContent(formData, fields, template);
      onSave({
        title: template.name,
        content: htmlContent,
        template: template.id,
        formData: formData
      });
    }
  };

  const renderField = (field) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="template-field">
            <label className="template-field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <textarea
              className={`template-field-input ${error ? 'error' : ''}`}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="template-field">
            <label className="template-field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <select
              className={`template-field-input ${error ? 'error' : ''}`}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="template-field checkbox-field">
            <label className="template-field-label checkbox-label">
              <input
                type="checkbox"
                checked={value === true || value === 'true'}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                className="template-checkbox"
              />
              <span>{field.label}</span>
            </label>
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      case 'date':
        return (
          <div key={field.name} className="template-field">
            <label className="template-field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="date"
              className={`template-field-input ${error ? 'error' : ''}`}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="template-field">
            <label className="template-field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="number"
              className={`template-field-input ${error ? 'error' : ''}`}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="template-field">
            <label className="template-field-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            <input
              type="text"
              className={`template-field-input ${error ? 'error' : ''}`}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
            {error && <span className="field-error">{error}</span>}
          </div>
        );
    }
  };

  if (!template) {
    return null;
  }

  // Если у шаблона нет полей, создаем заметку напрямую с базовым контентом
  if (fields.length === 0) {
    const handleCreateDirectly = () => {
      // Создаем базовую HTML структуру для Word-стиля
      const htmlContent = template.content || `<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000000; background: #ffffff; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 25.4mm 31.7mm; box-shadow: 0 0 20px rgba(0,0,0,0.1);">
<div style="text-align: center; margin-bottom: 24pt; border-bottom: 2px solid #000000; padding-bottom: 12pt;">
<h1 style="font-size: 18pt; font-weight: bold; margin: 0; color: #000000; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(template.name)}</h1>
</div>
<p style="margin: 0 0 12pt 0; text-indent: 0; text-align: justify;">Начните редактировать заметку...</p>
</div>`;
      
      onSave({
        title: template.name,
        content: htmlContent,
        template: template.id,
        formData: {}
      });
    };

    return (
      <div className="template-builder">
        <div className="template-builder-header">
          <h2>{template.name}</h2>
          {template.description && (
            <p className="template-description">{template.description}</p>
          )}
        </div>
        
        <div className="template-form">
          <p style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            Этот шаблон готов к использованию. Нажмите "Создать заметку", чтобы открыть редактор.
          </p>
          
          <div className="template-form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Отмена
            </button>
            <button type="button" onClick={handleCreateDirectly} className="btn-save">
              Создать заметку
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="template-builder">
      <div className="template-builder-header">
        <h2>{template.name}</h2>
        {template.description && (
          <p className="template-description">{template.description}</p>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="template-form">
        {fields.map(field => renderField(field))}
        
        <div className="template-form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Отмена
          </button>
          <button type="submit" className="btn-save">
            Создать заметку
          </button>
        </div>
      </form>
    </div>
  );
};

// Функция для генерации HTML контента из заполненных данных (Word-стиль)
const generateHTMLContent = (formData, fields, template) => {
  const parts = [];
  
  // Word-стиль: белый фон, Times New Roman, отступы как в Word (A4 формат)
  parts.push(`<div style="font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000000; background: #ffffff; width: 210mm; min-height: 297mm; margin: 0 auto; padding: 25.4mm 31.7mm; box-shadow: 0 0 20px rgba(0,0,0,0.1); page-break-after: always;">`);
  
  // Заголовок документа (Word-стиль)
  parts.push(`<div style="text-align: center; margin-bottom: 24pt; border-bottom: 2px solid #000000; padding-bottom: 12pt;">`);
  parts.push(`<h1 style="font-size: 18pt; font-weight: bold; margin: 0; color: #000000; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(template.name)}</h1>`);
  parts.push(`</div>`);
  
  // Содержимое документа
  fields.forEach(field => {
    const value = formData[field.name];
    if (value !== undefined && value !== null && value !== '' && value !== false) {
      const label = field.label;
      
      if (field.type === 'checkbox') {
        if (value === true || value === 'true') {
          parts.push(`<p style="margin: 0 0 12pt 0; text-indent: 0; text-align: justify;"><strong style="font-weight: bold;">${escapeHtml(label)}:</strong> Да</p>`);
        }
      } else if (field.type === 'textarea') {
        parts.push(`<div style="margin-bottom: 18pt;">`);
        parts.push(`<p style="margin: 0 0 6pt 0; font-weight: bold; font-size: 12pt; text-transform: uppercase; letter-spacing: 0.5px; color: #1a1a1a;">${escapeHtml(label)}</p>`);
        parts.push(`<p style="margin: 0 0 12pt 0; text-indent: 12.7mm; text-align: justify; white-space: pre-wrap; line-height: 1.5; border-left: 3px solid #0078d4; padding-left: 6pt;">${escapeHtml(value).replace(/\n/g, '<br>')}</p>`);
        parts.push(`</div>`);
      } else if (field.type === 'date') {
        const dateValue = new Date(value).toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        parts.push(`<p style="margin: 0 0 12pt 0; text-indent: 0; text-align: justify;"><strong style="font-weight: bold;">${escapeHtml(label)}:</strong> ${dateValue}</p>`);
      } else {
        parts.push(`<p style="margin: 0 0 12pt 0; text-indent: 0; text-align: justify;"><strong style="font-weight: bold;">${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`);
      }
    }
  });
  
  // Подпись внизу (как в Word)
  parts.push(`<div style="margin-top: 40pt; padding-top: 12pt; border-top: 1px solid #cccccc; text-align: right; font-size: 10pt; color: #666666;">`);
  parts.push(`<p style="margin: 0;">Создано: ${new Date().toLocaleDateString('ru-RU')}</p>`);
  parts.push(`</div>`);
  
  parts.push('</div>');
  return parts.join('\n');
};

// Функция для экранирования HTML
const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export default TemplateBuilder;

