import React from 'react';
import './StreakDisplay.css';

const FireIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="currentColor"/>
  </svg>
);

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
  </svg>
);

const StreakDisplay = ({ streak }) => {
  return (
    <div className="streak-display">
      <div className="streak-card">
        <div className="streak-icon"><FireIcon /></div>
        <div className="streak-info">
          <div className="streak-label">Текущий стрик</div>
          <div className="streak-value">{streak.streak_days} дней</div>
        </div>
      </div>
      
      <div className="streak-card">
        <div className="streak-icon"><StarIcon /></div>
        <div className="streak-info">
          <div className="streak-label">Лучший стрик</div>
          <div className="streak-value">{streak.longest_streak} дней</div>
        </div>
      </div>

      <div className="streak-progress">
        <div className="streak-progress-bar">
          <div
            className="streak-progress-fill"
            style={{ width: `${Math.min((streak.streak_days / 30) * 100, 100)}%` }}
          />
        </div>
        <div className="streak-progress-text">
          {streak.streak_days} / 30 дней
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
