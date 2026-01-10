import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <section className="landing-section hero-section">
        <div className="hero-content-wrapper">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="title-line">Ваши мысли.</span>
              <span className="title-line">Ваши идеи.</span>
              <span className="title-line highlight">Ваши заметки.</span>
            </h1>
            <p className="hero-subtitle">
              Современное приложение для создания и управления заметками.
              Красиво. Просто. Эффективно.
            </p>
            <div className="hero-buttons">
              <button 
                className="btn-primary-large"
                onClick={() => navigate('/register')}
              >
                Начать бесплатно
              </button>
              <button 
                className="btn-secondary-large"
                onClick={() => navigate('/login')}
              >
                Войти
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <svg viewBox="0 0 800 600" className="hero-svg">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#90EE90", stopOpacity:1}} />
                  <stop offset="50%" style={{stopColor:"#7FDD7F", stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#FFD700", stopOpacity:1}} />
                </linearGradient>
                <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#ffffff", stopOpacity:0.95}} />
                  <stop offset="100%" style={{stopColor:"#f8f8f8", stopOpacity:0.95}} />
                </linearGradient>
                <filter id="shadow">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
                  <feOffset dx="0" dy="4" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Основной блок заметки с тенью */}
              <g filter="url(#shadow)">
                <rect x="150" y="60" width="500" height="480" rx="24" fill="url(#grad1)" opacity="0.15"/>
                <rect x="170" y="80" width="460" height="440" rx="16" fill="url(#grad2)" className="note-paper"/>
              </g>
              
              {/* Заголовок заметки */}
              <rect x="200" y="110" width="400" height="8" rx="4" fill="#90EE90" opacity="0.6"/>
              <rect x="200" y="125" width="320" height="6" rx="3" fill="#E0E0E0" opacity="0.4"/>
              
              {/* Линии текста */}
              <line x1="200" y1="160" x2="580" y2="160" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              <line x1="200" y1="190" x2="560" y2="190" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              <line x1="200" y1="220" x2="540" y2="220" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              <line x1="200" y1="250" x2="570" y2="250" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              <line x1="200" y1="280" x2="520" y2="280" stroke="#E0E0E0" strokeWidth="2.5" strokeLinecap="round" opacity="0.6"/>
              
              {/* Декоративные элементы - папки */}
              <g opacity="0.4">
                <rect x="220" y="320" width="50" height="40" rx="4" fill="#90EE90" opacity="0.3"/>
                <rect x="220" y="320" width="50" height="12" rx="4" fill="#90EE90" opacity="0.5"/>
                <g transform="translate(245, 345) scale(0.8)">
                  <path d="M-8 -6H6C6.5 -6 7 -5.8 7.4 -5.4C7.8 -5 8 -4.5 8 -4V8C8 8.5 7.8 9 7.4 9.4C7 9.8 6.5 10 6 10H-8C-8.5 10 -9 9.8 -9.4 9.4C-9.8 9 -10 8.5 -10 8V-4C-10 -4.5 -9.8 -5 -9.4 -5.4C-9 -5.8 -8.5 -6 -8 -6Z" stroke="#90EE90" strokeWidth="1.5" fill="#90EE90" fillOpacity="0.2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M-4 -6V-2H6" stroke="#90EE90" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </g>
              </g>
              
              <g opacity="0.4">
                <rect x="300" y="320" width="50" height="40" rx="4" fill="#FFD700" opacity="0.3"/>
                <rect x="300" y="320" width="50" height="12" rx="4" fill="#FFD700" opacity="0.5"/>
                <g transform="translate(325, 345) scale(0.8)">
                  <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#FFD700" opacity="0.9"/>
                  <path d="M-2 -6V2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="-2" cy="-2" r="1" fill="white"/>
                </g>
              </g>
              
              <g opacity="0.4">
                <rect x="380" y="320" width="50" height="40" rx="4" fill="#90EE90" opacity="0.3"/>
                <rect x="380" y="320" width="50" height="12" rx="4" fill="#90EE90" opacity="0.5"/>
                <g transform="translate(405, 345) scale(0.8)">
                  <path d="M-8 -8H4C4.5 -8 5 -7.8 5.4 -7.4C5.8 -7 6 -6.5 6 -6V6C6 6.5 5.8 7 5.4 7.4C5 7.8 4.5 8 4 8H-8C-8.5 8 -9 7.8 -9.4 7.4C-9.8 7 -10 6.5 -10 6V-6C-10 -6.5 -9.8 -7 -9.4 -7.4C-9 -7.8 -8.5 -8 -8 -8Z" stroke="#90EE90" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M-2 -8V2H6" stroke="#90EE90" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M-4 -1H4" stroke="#90EE90" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M-4 3H4" stroke="#90EE90" strokeWidth="1.5" strokeLinecap="round"/>
                </g>
              </g>
              
              {/* Декоративная линия */}
              <path d="M 200 400 Q 300 380, 400 400 T 600 400" stroke="#90EE90" strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round"/>
              
              {/* Акцентные точки */}
              <circle cx="250" cy="450" r="6" fill="#90EE90" opacity="0.5"/>
              <circle cx="400" cy="450" r="6" fill="#FFD700" opacity="0.5"/>
              <circle cx="550" cy="450" r="6" fill="#90EE90" opacity="0.5"/>
            </svg>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-section features-section">
        <div className="section-content">
          <h2 className="section-title">Все, что нужно для работы с заметками</h2>
          <div className="features-grid">
            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 64 64" fill="none">
                <path d="M32 8L40 24H56L44 34L48 50L32 42L16 50L20 34L8 24H24L32 8Z" fill="currentColor"/>
              </svg>
              <h3 className="feature-title">Богатый редактор</h3>
              <p className="feature-description">
                Редактор как в Word с полным форматированием текста, 
                таблицами, изображениями и ссылками.
              </p>
            </div>
            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 64 64" fill="none">
                <rect x="12" y="12" width="40" height="40" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                <line x1="20" y1="20" x2="44" y2="20" stroke="currentColor" strokeWidth="2"/>
                <line x1="20" y1="28" x2="44" y2="28" stroke="currentColor" strokeWidth="2"/>
                <line x1="20" y1="36" x2="36" y2="36" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <h3 className="feature-title">Шаблоны</h3>
              <p className="feature-description">
                10 готовых шаблонов для разных задач: протоколы, 
                рецепты, дневники и многое другое.
              </p>
            </div>
            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 64 64" fill="none">
                <path d="M16 16H48V48H16V16Z" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M20 20H28V28H20V20Z" fill="currentColor"/>
                <path d="M36 20H44V28H36V20Z" fill="currentColor"/>
                <path d="M20 36H28V44H20V36Z" fill="currentColor"/>
                <path d="M36 36H44V44H36V36Z" fill="currentColor"/>
              </svg>
              <h3 className="feature-title">Организация</h3>
              <p className="feature-description">
                Папки, теги, умные папки и поиск — все для удобной 
                организации ваших заметок.
              </p>
            </div>
            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M32 12V32L42 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3 className="feature-title">Темная тема</h3>
              <p className="feature-description">
                Комфортная работа в любое время суток с поддержкой 
                светлой и темной темы.
              </p>
            </div>
            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 64 64" fill="none">
                <path d="M32 8L40 20H52L44 28L48 40L32 34L16 40L20 28L12 20H24L32 8Z" fill="currentColor"/>
              </svg>
              <h3 className="feature-title">Быстро</h3>
              <p className="feature-description">
                Мгновенный поиск, клавиатурные сокращения и 
                автосохранение для максимальной продуктивности.
              </p>
            </div>
            <div className="feature-card">
              <svg className="feature-icon" viewBox="0 0 64 64" fill="none">
                <rect x="16" y="20" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="M24 20V16C24 12 26 10 32 10C38 10 40 12 40 16V20" stroke="currentColor" strokeWidth="2"/>
                <circle cx="32" cy="32" r="4" fill="currentColor"/>
              </svg>
              <h3 className="feature-title">Безопасно</h3>
              <p className="feature-description">
                Ваши данные защищены. Все заметки хранятся 
                безопасно и доступны только вам.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
