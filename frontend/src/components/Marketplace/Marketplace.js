import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '../../api/api';
import MarketplaceItem from './MarketplaceItem';
import UploadItem from './UploadItem';
import Layout from '../Layout/Layout';
import './Marketplace.css';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadItems();
  }, [filter]);

  const loadItems = async () => {
    try {
      const params = filter !== 'all' ? { type: filter } : {};
      const response = await marketplaceAPI.getItems(params);
      setItems(response.data);
    } catch (error) {
      console.error('Error loading marketplace items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="marketplace">
      <div className="marketplace-header">
        <h1>Маркетплейс</h1>
        <button
          className="marketplace-upload-btn"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? 'Отмена' : 'Загрузить товар'}
        </button>
      </div>

      {showUpload && (
        <UploadItem
          onUploadComplete={() => {
            setShowUpload(false);
            loadItems();
          }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      <div className="marketplace-filters">
        <div className="marketplace-search">
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="marketplace-search-input"
          />
        </div>
        <div className="marketplace-filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button
            className={`filter-tab ${filter === 'template' ? 'active' : ''}`}
            onClick={() => setFilter('template')}
          >
            Шаблоны
          </button>
          <button
            className={`filter-tab ${filter === 'font' ? 'active' : ''}`}
            onClick={() => setFilter('font')}
          >
            Шрифты
          </button>
          <button
            className={`filter-tab ${filter === 'animation' ? 'active' : ''}`}
            onClick={() => setFilter('animation')}
          >
            Анимации
          </button>
          <button
            className={`filter-tab ${filter === 'theme' ? 'active' : ''}`}
            onClick={() => setFilter('theme')}
          >
            Темы
          </button>
        </div>
      </div>

      {loading ? (
        <div className="marketplace-loading">Загрузка товаров...</div>
      ) : filteredItems.length === 0 ? (
        <div className="marketplace-empty">
          <p>Товары не найдены</p>
        </div>
      ) : (
        <div className="marketplace-grid">
          {filteredItems.map(item => (
            <MarketplaceItem
              key={item.id}
              item={item}
              onPurchase={loadItems}
            />
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default Marketplace;
