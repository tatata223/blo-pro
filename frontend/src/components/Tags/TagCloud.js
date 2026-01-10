import React, { useState, useEffect } from 'react';
import { tagsAPI } from '../../api/api';
import './TagCloud.css';

const TagCloud = ({ onTagSelect, selectedTags = [] }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTagCloud();
  }, []);

  const loadTagCloud = async () => {
    try {
      const response = await tagsAPI.getCloud();
      setTags(response.data || []);
    } catch (error) {
      console.error('Error loading tag cloud:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tag) => {
    if (onTagSelect) {
      onTagSelect(tag.id);
    }
  };

  if (loading) {
    return <div className="tag-cloud-loading">Загрузка тегов...</div>;
  }

  if (tags.length === 0) {
    return (
      <div className="tag-cloud-empty">
        <p>Теги не найдены</p>
      </div>
    );
  }

  // Сортируем теги по размеру для лучшей визуализации
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);

  return (
    <div className="tag-cloud">
      <h3 className="tag-cloud-title">Облако тегов</h3>
      <div className="tag-cloud-container">
        {sortedTags.map(tag => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <span
              key={tag.id}
              className={`tag-cloud-item ${isSelected ? 'selected' : ''}`}
              style={{
                fontSize: `${tag.size}px`,
                color: tag.color,
                borderColor: tag.color,
                backgroundColor: isSelected ? tag.color : 'transparent',
                opacity: tag.count > 0 ? 1 : 0.5
              }}
              onClick={() => handleTagClick(tag)}
              title={`${tag.name} (${tag.count} заметок)`}
            >
              {tag.name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default TagCloud;








