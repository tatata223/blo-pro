import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Очищаем ошибку при изменении
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Валидация паролей
    if (formData.password !== formData.password2) {
      setError('Пароли не совпадают. Пожалуйста, убедитесь, что оба поля пароля содержат одинаковый пароль.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов.');
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Пожалуйста, введите корректный email адрес.');
      return;
    }

    // Валидация username
    if (formData.username.length < 3) {
      setError('Имя пользователя должно содержать минимум 3 символа.');
      return;
    }

    setLoading(true);
    try {
      const userData = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      // Ждем, пока состояние обновится
      if (userData) {
        // Небольшая задержка для обновления состояния в контексте
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 200);
      } else {
        // Если нет данных, ждем еще немного
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 500);
      }
    } catch (err) {
      // Детальная обработка ошибок
      let errorMessage = 'Ошибка регистрации';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        
        // Обработка различных типов ошибок от сервера
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.username) {
          errorMessage = `Имя пользователя: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`;
        } else if (errorData.email) {
          errorMessage = `Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`;
        } else if (errorData.password) {
          errorMessage = `Пароль: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          // Если это объект с несколькими ошибками
          const firstError = Object.values(errorData)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const NoteIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const WarningIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1><NoteIcon /></h1>
        <h2>Создать аккаунт</h2>
        <p className="auth-subtitle">Начните создавать и организовывать свои заметки</p>
        {error && (
          <div className="error-message-detailed">
            <div className="error-icon"><WarningIcon /></div>
            <div className="error-text">
              <strong>Ошибка регистрации:</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              autoFocus
              placeholder="Выберите имя пользователя"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Минимум 8 символов"
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label>Подтвердите пароль</label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              placeholder="Повторите пароль"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Регистрация...' : 'Создать аккаунт'}
          </button>
        </form>
        <div className="auth-divider">
          <span>или</span>
        </div>
        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login" className="auth-link-button">Войти</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;


