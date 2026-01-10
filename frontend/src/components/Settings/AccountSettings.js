import React, { useState, useEffect } from 'react';
import { profileAPI } from '../../api/api';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import './AccountSettings.css';

const AccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    profile_visibility: 'public',
    show_email: false,
    show_statistics: true,
    allow_follow_requests: true,
    default_note_visibility: 'private',
    auto_save_enabled: true,
    auto_save_interval: 30,
    email_notifications: false,
    push_notifications: true,
    notify_on_follow: true,
    notify_on_message: true,
    two_factor_enabled: false,
    session_timeout: 7,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await profileAPI.getSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await profileAPI.updateSettings(settings);
      toast.success('Настройки успешно сохранены');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error(error.response?.data?.error || 'Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="account-settings">
      <div className="settings-header">
        <h1>Настройки аккаунта</h1>
        <p className="settings-subtitle">Управление конфиденциальностью и настройками</p>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="settings-section">
          <h2 className="settings-section-title">Приватность профиля</h2>
          
          <div className="settings-form-group">
            <label htmlFor="profile_visibility" className="settings-label">
              Видимость профиля
            </label>
            <select
              id="profile_visibility"
              name="profile_visibility"
              value={settings.profile_visibility}
              onChange={handleChange}
              className="settings-select"
            >
              <option value="public">Публичный</option>
              <option value="friends">Только друзья</option>
              <option value="private">Приватный</option>
            </select>
            <p className="settings-help">Кто может просматривать ваш профиль</p>
          </div>

          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="show_email"
                checked={settings.show_email}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Показывать email в профиле</span>
            </label>
          </div>

          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="show_statistics"
                checked={settings.show_statistics}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Показывать статистику</span>
            </label>
          </div>

          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="allow_follow_requests"
                checked={settings.allow_follow_requests}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Разрешить запросы на подписку</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">Настройки заметок</h2>
          
          <div className="settings-form-group">
            <label htmlFor="default_note_visibility" className="settings-label">
              Видимость заметок по умолчанию
            </label>
            <select
              id="default_note_visibility"
              name="default_note_visibility"
              value={settings.default_note_visibility}
              onChange={handleChange}
              className="settings-select"
            >
              <option value="public">Публичная</option>
              <option value="friends">Друзья</option>
              <option value="private">Приватная</option>
            </select>
            <p className="settings-help">Видимость новых заметок по умолчанию</p>
          </div>

          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="auto_save_enabled"
                checked={settings.auto_save_enabled}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Автосохранение заметок</span>
            </label>
          </div>

          {settings.auto_save_enabled && (
            <div className="settings-form-group">
              <label htmlFor="auto_save_interval" className="settings-label">
                Интервал автосохранения (секунды)
              </label>
              <input
                type="number"
                id="auto_save_interval"
                name="auto_save_interval"
                value={settings.auto_save_interval}
                onChange={handleChange}
                className="settings-input"
                min="10"
                max="300"
              />
            </div>
          )}
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">Уведомления</h2>
          
          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="email_notifications"
                checked={settings.email_notifications}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Email уведомления</span>
            </label>
          </div>

          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="push_notifications"
                checked={settings.push_notifications}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Push уведомления</span>
            </label>
          </div>

          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="notify_on_follow"
                checked={settings.notify_on_follow}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Уведомлять о подписках</span>
            </label>
          </div>

          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="notify_on_message"
                checked={settings.notify_on_message}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Уведомлять о сообщениях</span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">Безопасность</h2>
          
          <div className="settings-checkbox-group">
            <label className="settings-checkbox-label">
              <input
                type="checkbox"
                name="two_factor_enabled"
                checked={settings.two_factor_enabled}
                onChange={handleChange}
                className="settings-checkbox"
              />
              <span>Двухфакторная аутентификация</span>
            </label>
            <p className="settings-help">Дополнительная защита аккаунта</p>
          </div>

          <div className="settings-form-group">
            <label htmlFor="session_timeout" className="settings-label">
              Таймаут сессии (дни)
            </label>
            <input
              type="number"
              id="session_timeout"
              name="session_timeout"
              value={settings.session_timeout}
              onChange={handleChange}
              className="settings-input"
              min="1"
              max="30"
            />
            <p className="settings-help">Через сколько дней сессия будет закрыта</p>
          </div>
        </div>

        <div className="settings-actions">
          <button
            type="submit"
            className="settings-save-btn"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>
      </div>
    </Layout>
  );
};

export default AccountSettings;
