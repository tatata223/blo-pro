import React, { useState, useRef, useEffect } from 'react';
import './ColorPicker.css';

const ColorPicker = ({ value, onChange, label = 'Цвет' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  // Предустановленные цвета
  const presetColors = [
    '#90EE90', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3',
    '#F38181', '#AA96DA', '#FCBAD3', '#FFE66D', '#A8E6CF',
    '#FF8B94', '#FFAAA5', '#FFD3A5', '#A8D8EA', '#C7CEEA',
    '#B4A7D6', '#D4A5A5', '#E8B4B8', '#F5CAC3', '#F7DC6F'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
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

  const handleColorSelect = (color) => {
    onChange(color);
    setIsOpen(false);
  };

  return (
    <div className="color-picker-neu" ref={pickerRef}>
      <label className="color-picker-label">{label}:</label>
      <div className="color-picker-wrapper">
        <button
          type="button"
          className="color-picker-trigger"
          onClick={() => setIsOpen(!isOpen)}
          style={{ backgroundColor: value }}
        >
          <span className="color-preview" style={{ backgroundColor: value }}></span>
        </button>
        {isOpen && (
          <div className="color-picker-popup">
            <div className="color-picker-presets">
              {presetColors.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  className={`color-preset-item ${value === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                  title={color}
                />
              ))}
            </div>
            <div className="color-picker-custom">
              <label>Выбрать свой цвет:</label>
              <input
                type="color"
                value={value}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="color-picker-input"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ColorPicker;


