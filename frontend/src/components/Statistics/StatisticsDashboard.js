import React, { useState, useEffect } from 'react';
import { statisticsAPI } from '../../api/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Layout from '../Layout/Layout';
import './StatisticsDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatisticsDashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [rating, setRating] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
    loadRating();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await statisticsAPI.getUserStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRating = async () => {
    try {
      const response = await statisticsAPI.getUserRating();
      setRating(response.data);
    } catch (error) {
      console.error('Error loading rating:', error);
    }
  };

  if (loading) {
    return <div className="statistics-loading">Загрузка статистики...</div>;
  }

  if (!statistics) {
    return <div className="statistics-error">Ошибка загрузки статистики</div>;
  }

  // Данные для графика активности (заглушка - в реальности нужны данные по дням)
  const activityData = {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    datasets: [
      {
        label: 'Заметок создано',
        data: [5, 8, 12, 6, 10, 7, 9],
        borderColor: '#7BC47F',
        backgroundColor: 'rgba(123, 196, 127, 0.3)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#7BC47F',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#6BB06F',
        pointHoverBorderColor: '#fff',
      },
    ],
  };

  const speedData = {
    labels: ['Средняя', 'Максимальная', 'Текущая'],
    datasets: [
      {
        label: 'Скорость печати (WPM)',
        data: [
          statistics.typing_speed_wpm || 0,
          statistics.typing_speed_wpm * 1.5 || 0,
          statistics.typing_speed_wpm || 0,
        ],
        backgroundColor: [
          'rgba(123, 196, 127, 0.8)',
          'rgba(230, 200, 102, 0.8)',
          'rgba(123, 196, 127, 0.8)',
        ],
        borderColor: [
          '#7BC47F',
          '#E6C866',
          '#7BC47F',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: 'var(--text-color)',
          font: {
            size: 12,
            family: 'inherit',
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'var(--card-bg)',
        titleColor: 'var(--text-color)',
        bodyColor: 'var(--text-color)',
        borderColor: 'var(--border-color)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'var(--border-color)',
          drawBorder: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: 'var(--text-secondary)',
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'var(--border-color)',
          drawBorder: false,
        },
      },
    },
  };

  return (
    <Layout>
      <div className="statistics-dashboard">
        <div className="statistics-header">
          <h2>Статистика активности</h2>
        </div>

      <div className="statistics-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.total_notes || 0}</div>
            <div className="stat-label">Всего заметок</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M6 10H18M6 14H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(statistics.typing_speed_wpm || 0)}</div>
            <div className="stat-label">Скорость (WPM)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 6V12M12 12L9 9M12 12L15 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.streak_days || 0}</div>
            <div className="stat-label">Дней подряд</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{Math.round(statistics.rating_score || 0)}</div>
            <div className="stat-label">Рейтинг</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 10V3H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.level || 1}</div>
            <div className="stat-label">Уровень</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{statistics.experience_points || 0}</div>
            <div className="stat-label">Опыт</div>
          </div>
        </div>
      </div>

      <div className="statistics-charts">
        <div className="chart-container">
          <h3>Активность по дням</h3>
          <div className="chart-wrapper">
            <Line data={activityData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-container">
          <h3>Скорость печати</h3>
          <div className="chart-wrapper">
            <Bar data={speedData} options={chartOptions} />
          </div>
        </div>
      </div>

      {rating.length > 0 && (
        <div className="rating-section">
          <h3>Рейтинг пользователей</h3>
          <div className="rating-list">
            {rating.slice(0, 10).map((user, index) => (
              <div key={user.user_id} className="rating-item">
                <span className="rating-rank">#{user.rank}</span>
                <span className="rating-username">{user.username}</span>
                <span className="rating-score">{Math.round(user.rating)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default StatisticsDashboard;


