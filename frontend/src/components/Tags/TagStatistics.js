import React, { useState, useEffect } from 'react';
import { tagsAPI } from '../../api/api';
import './TagStatistics.css';

const TagStatistics = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await tagsAPI.getStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="tag-statistics-loading">Загрузка статистики...</div>;
  }

  if (!statistics) {
    return null;
  }

  const ChartIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '8px' }}>
      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16L11 12L15 16L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 10H15V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="tag-statistics">
      <h3 className="tag-statistics-title">
        <ChartIcon />
        Статистика тегов
      </h3>
      
      <div className="statistics-summary">
        <div className="stat-item">
          <span className="stat-label">Всего тегов:</span>
          <span className="stat-value">{statistics.total_tags}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Использований:</span>
          <span className="stat-value">{statistics.total_usage}</span>
        </div>
      </div>

      {statistics.most_used && statistics.most_used.length > 0 && (
        <div className="most-used-tags">
          <h4>Популярные теги:</h4>
          <div className="most-used-list">
            {statistics.most_used.map((tag, index) => (
              <div key={tag.id} className="most-used-item">
                <span className="rank">#{index + 1}</span>
                <span 
                  className="tag-name"
                  style={{ color: tag.color }}
                >
                  {tag.name}
                </span>
                <span className="usage-count">{tag.usage_count} использований</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagStatistics;








