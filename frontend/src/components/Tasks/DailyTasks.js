import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../../api/api';
import TaskCard from './TaskCard';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import './DailyTasks.css';

const DailyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('daily');

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getDailyTasks(filter);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId) => {
    try {
      await tasksAPI.completeTask(taskId);
      toast.success('Задание выполнено! Валюту начислено.');
      loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.response?.data?.error || 'Ошибка выполнения задания');
    }
  };

  return (
    <Layout>
      <div className="daily-tasks">
      <div className="daily-tasks-header">
        <h1>Задания</h1>
        <div className="daily-tasks-filter-tabs">
          <button
            className={`task-filter-tab ${filter === 'daily' ? 'active' : ''}`}
            onClick={() => setFilter('daily')}
          >
            Ежедневные
          </button>
          <button
            className={`task-filter-tab ${filter === 'weekly' ? 'active' : ''}`}
            onClick={() => setFilter('weekly')}
          >
            Еженедельные
          </button>
          <button
            className={`task-filter-tab ${filter === 'special' ? 'active' : ''}`}
            onClick={() => setFilter('special')}
          >
            Специальные
          </button>
        </div>
      </div>

      {loading ? (
        <div className="daily-tasks-loading">Загрузка заданий...</div>
      ) : tasks.length === 0 ? (
        <div className="daily-tasks-empty">
          <p>Нет доступных заданий</p>
        </div>
      ) : (
        <div className="daily-tasks-grid">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={handleTaskComplete}
            />
          ))}
        </div>
      )}
      </div>
    </Layout>
  );
};

export default DailyTasks;
