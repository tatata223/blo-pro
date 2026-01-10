import React, { useState } from 'react';
import ColorPicker from './ColorPicker';
import './Forms.css';

const FolderForm = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#90EE90');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), color });
    }
  };

  return (
    <form className="sidebar-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Название папки"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="form-input"
      />
      <ColorPicker
        value={color}
        onChange={setColor}
        label="Цвет"
      />
      <div className="form-actions">
        <button type="submit" className="btn-save">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button type="button" onClick={onCancel} className="btn-cancel">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </form>
  );
};

export default FolderForm;







