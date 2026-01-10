import React, { useState } from 'react';
import { marketplaceAPI } from '../../api/api';
import toast from 'react-hot-toast';
import './UploadItem.css';

const UploadItem = ({ onUploadComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    item_type: 'template',
    price: 0,
    description: '',
  });
  const [file, setFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handlePreviewImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setPreviewImage(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Название товара обязательно');
      return;
    }

    setLoading(true);
    try {
      await marketplaceAPI.uploadItem({
        ...formData,
        file,
        preview_image: previewImage,
      });
      toast.success('Товар успешно загружен!');
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error('Error uploading item:', error);
      toast.error(error.response?.data?.error || 'Ошибка загрузки товара');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-item">
      <div className="upload-item-header">
        <h2>Загрузить товар</h2>
        <button className="upload-item-close" onClick={onCancel}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <form className="upload-item-form" onSubmit={handleSubmit}>
        <div className="upload-item-group">
          <label htmlFor="name" className="upload-item-label">
            Название товара *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="upload-item-input"
            required
            maxLength={200}
          />
        </div>

        <div className="upload-item-group">
          <label htmlFor="item_type" className="upload-item-label">
            Тип товара
          </label>
          <select
            id="item_type"
            name="item_type"
            value={formData.item_type}
            onChange={handleInputChange}
            className="upload-item-select"
          >
            <option value="template">Шаблон</option>
            <option value="font">Шрифт</option>
            <option value="animation">Анимация</option>
            <option value="theme">Тема</option>
          </select>
        </div>

        <div className="upload-item-group">
          <label htmlFor="price" className="upload-item-label">
            Цена (монеты)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className="upload-item-input"
            min="0"
            step="0.01"
          />
        </div>

        <div className="upload-item-group">
          <label htmlFor="description" className="upload-item-label">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="upload-item-textarea"
            rows={4}
          />
        </div>

        <div className="upload-item-group">
          <label htmlFor="file" className="upload-item-label">
            Файл товара
          </label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            className="upload-item-file"
          />
        </div>

        <div className="upload-item-group">
          <label htmlFor="preview_image" className="upload-item-label">
            Превью изображение
          </label>
          <input
            type="file"
            id="preview_image"
            name="preview_image"
            accept="image/*"
            onChange={handlePreviewImageChange}
            className="upload-item-file"
          />
        </div>

        <div className="upload-item-actions">
          <button
            type="button"
            className="upload-item-cancel-btn"
            onClick={onCancel}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="upload-item-submit-btn"
            disabled={loading}
          >
            {loading ? 'Загрузка...' : 'Загрузить'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadItem;
