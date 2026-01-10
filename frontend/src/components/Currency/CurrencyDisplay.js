import React, { useState, useEffect } from 'react';
import { currencyAPI } from '../../api/api';
import './CurrencyDisplay.css';

const CurrencyDisplay = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        currencyAPI.getBalance(),
        currencyAPI.getTransactions(),
      ]);
      setBalance(balanceRes.data.balance);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error loading currency data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="currency-display-loading">Загрузка...</div>;
  }

  const CoinIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="currentColor"/>
      <path d="M12 6V18M6 12H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  );

  const PlusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const MinusIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className="currency-display">
      <div className="currency-balance-card">
        <div className="currency-balance-icon"><CoinIcon /></div>
        <div className="currency-balance-info">
          <div className="currency-balance-label">Баланс</div>
          <div className="currency-balance-value">{balance} монет</div>
        </div>
      </div>

      <div className="currency-transactions">
        <h3 className="currency-transactions-title">История транзакций</h3>
        {transactions.length === 0 ? (
          <div className="currency-transactions-empty">
            <p>Нет транзакций</p>
          </div>
        ) : (
          <div className="currency-transactions-list">
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className={`currency-transaction ${transaction.transaction_type}`}
              >
                <div className="transaction-icon">
                  {transaction.transaction_type === 'earn' ? <PlusIcon /> : <MinusIcon />}
                </div>
                <div className="transaction-info">
                  <div className="transaction-description">{transaction.description}</div>
                  <div className="transaction-date">
                    {new Date(transaction.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className={`transaction-amount ${transaction.transaction_type}`}>
                  {transaction.transaction_type === 'earn' ? '+' : '-'}
                  {transaction.amount} монет
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CurrencyDisplay;
