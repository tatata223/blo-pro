import React, { useState, useEffect } from 'react';
import { marketplaceAPI, currencyAPI } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './MarketplaceItem.css';

const MarketplaceItem = ({ item, onPurchase }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(null);

  useEffect(() => {
    if (user) {
      loadBalance();
    }
  }, [user]);

  const loadBalance = async () => {
    try {
      const response = await currencyAPI.getBalance();
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Необходима авторизация');
      return;
    }

    if (item.is_purchased) {
      toast.info('Товар уже куплен');
      return;
    }

    if (balance !== null && balance < item.price) {
      toast.error('Недостаточно средств');
      return;
    }

    setLoading(true);
    try {
      await marketplaceAPI.purchaseItem(item.id);
      toast.success('Товар успешно куплен!');
      if (onPurchase) onPurchase();
      loadBalance();
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast.error(error.response?.data?.error || 'Ошибка покупки');
    } finally {
      setLoading(false);
    }
  };

  const getItemTypeLabel = (type) => {
    const labels = {
      template: 'Шаблон',
      font: 'Шрифт',
      animation: 'Анимация',
      theme: 'Тема',
    };
    return labels[type] || type;
  };

  return (
    <div className={`marketplace-item ${item.is_purchased ? 'purchased' : ''}`}>
      {item.preview_image && (
        <div className="marketplace-item-preview">
          <img src={item.preview_image} alt={item.name} />
        </div>
      )}
      <div className="marketplace-item-content">
        <div className="marketplace-item-header">
          <span className="marketplace-item-type">{getItemTypeLabel(item.item_type)}</span>
          {item.is_purchased && (
            <span className="marketplace-item-badge">Куплено</span>
          )}
        </div>
        <h3 className="marketplace-item-name">{item.name}</h3>
        <p className="marketplace-item-description">{item.description}</p>
        <div className="marketplace-item-footer">
          <div className="marketplace-item-stats">
            <span className="marketplace-item-price">{item.price} монет</span>
            <span className="marketplace-item-rating">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
              </svg>
              {item.rating.toFixed(1)}
            </span>
            <span className="marketplace-item-purchases">{item.purchases_count} покупок</span>
          </div>
          {!item.is_purchased && (
            <button
              className="marketplace-item-buy-btn"
              onClick={handlePurchase}
              disabled={loading || (balance !== null && balance < item.price)}
            >
              {loading ? 'Покупка...' : 'Купить'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketplaceItem;
