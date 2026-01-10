import React, { useState, useEffect } from 'react';
import { firefliesAPI } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import FireflyAnimation from './FireflyAnimation';
import StreakDisplay from './StreakDisplay';
import Layout from '../Layout/Layout';
import './FirefliesSystem.css';

const FirefliesSystem = () => {
  const { user } = useAuth();
  const [fireflies, setFireflies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ streak_days: 0, longest_streak: 0 });

  useEffect(() => {
    if (user) {
      loadFireflies();
      loadStreak();
      checkStreak();
    }
  }, [user]);

  const loadFireflies = async () => {
    try {
      const response = await firefliesAPI.getFireflies();
      setFireflies(response.data);
    } catch (error) {
      console.error('Error loading fireflies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStreak = async () => {
    if (!user) return;
    try {
      const response = await firefliesAPI.getUserStreak(user.id);
      setStreak(response.data);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const checkStreak = async () => {
    try {
      await firefliesAPI.checkStreak();
      loadStreak();
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  };

  return (
    <Layout>
      <div className="fireflies-system">
      <StreakDisplay streak={streak} />
      
      <div className="fireflies-received">
        <h2 className="fireflies-title">Огоньки от друзей</h2>
        {loading ? (
          <div className="fireflies-loading">Загрузка...</div>
        ) : fireflies.length === 0 ? (
          <div className="fireflies-empty">
            <p>Пока нет огоньков</p>
          </div>
        ) : (
          <div className="fireflies-list">
            {fireflies.map(firefly => (
              <div key={firefly.id} className="firefly-item">
                <FireflyAnimation />
                <div className="firefly-content">
                  <div className="firefly-sender">
                    {firefly.sender.username}
                  </div>
                  {firefly.message && (
                    <div className="firefly-message">{firefly.message}</div>
                  )}
                  {firefly.note && (
                    <div className="firefly-note">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {firefly.note.title}
                    </div>
                  )}
                  <div className="firefly-time">
                    {new Date(firefly.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default FirefliesSystem;
