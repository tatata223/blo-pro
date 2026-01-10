import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, onComplete }) => {
  const handleComplete = () => {
    if (!task.is_completed && onComplete) {
      onComplete(task.id);
    }
  };

  const getTaskTypeLabel = (type) => {
    const labels = {
      daily: 'Ежедневное',
      weekly: 'Еженедельное',
      special: 'Специальное',
    };
    return labels[type] || type;
  };

  return (
    <div className={`task-card ${task.is_completed ? 'completed' : ''}`}>
      <div className="task-card-header">
        <span className="task-card-type">{getTaskTypeLabel(task.task_type)}</span>
        {task.is_completed && (
          <span className="task-card-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '4px' }}>
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Выполнено
          </span>
        )}
      </div>
      <h3 className="task-card-title">{task.title}</h3>
      <p className="task-card-description">{task.description}</p>
      <div className="task-card-footer">
        <div className="task-card-reward">
          <span className="task-card-reward-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="currentColor"/>
              <path d="M12 6V18M6 12H18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          </span>
          <span className="task-card-reward-amount">{task.reward} монет</span>
        </div>
        {!task.is_completed && (
          <button
            className="task-card-complete-btn"
            onClick={handleComplete}
          >
            Выполнить
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
