import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileAPI } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import Layout from '../Layout/Layout';
import './ProfileEdit.css';

const ProfileEdit = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
    is_public: false,
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await profileAPI.getUserProfile(currentUser?.id);
      const profile = response.data;
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        is_public: profile.is_public || false,
      });
      if (profile.avatar) {
        setAvatarPreview(profile.avatar);
      }
      if (profile.cover_image) {
        setCoverPreview(profile.cover_image);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Ошибка загрузки профиля');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла аватара не должен превышать 5 МБ');
        return;
      }
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Размер файла обложки не должен превышать 10 МБ');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('display_name', formData.display_name);
      formDataToSend.append('bio', formData.bio);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('website', formData.website);
      formDataToSend.append('is_public', formData.is_public);

      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      if (coverImage) {
        formDataToSend.append('cover_image', coverImage);
      }

      const response = await profileAPI.updateProfile(formDataToSend);
      toast.success('Профиль успешно обновлен');
      
      // Обновляем контекст аутентификации с новыми данными
      if (response && response.data && response.data.profile) {
        const updatedProfile = response.data.profile;
        // Обновляем localStorage и перезагружаем пользователя
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            userData.avatar = updatedProfile.avatar;
            userData.display_name = updatedProfile.display_name;
            userData.is_public = updatedProfile.is_public;
            localStorage.setItem('user', JSON.stringify(userData));
          } catch (e) {
            console.error('Error updating user in localStorage:', e);
          }
        }
      }
      
      navigate(`/profile/${currentUser?.id}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.error || error.response?.data?.message || 'Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/profile/${currentUser?.id}`);
  };

  return (
    <Layout>
      <div className="profile-edit">
      <div className="profile-edit-header">
        <h1>Редактирование профиля</h1>
        <button className="profile-edit-cancel-btn" onClick={handleCancel}>
          Отмена
        </button>
      </div>

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <div className="profile-edit-section">
          <h2 className="profile-edit-section-title">Обложка профиля</h2>
          <div className="profile-edit-cover">
            {coverPreview ? (
              <div 
                className="profile-edit-cover-preview"
                style={{ backgroundImage: `url(${coverPreview})` }}
              />
            ) : (
              <div className="profile-edit-cover-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 19V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Добавить обложку</span>
              </div>
            )}
            <label className="profile-edit-file-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="profile-edit-file-input"
              />
              {coverPreview ? 'Изменить обложку' : 'Загрузить обложку'}
            </label>
            {coverPreview && (
              <button
                type="button"
                className="profile-edit-remove-btn"
                onClick={() => {
                  setCoverImage(null);
                  setCoverPreview(null);
                }}
              >
                Удалить
              </button>
            )}
          </div>
        </div>

        <div className="profile-edit-section">
          <h2 className="profile-edit-section-title">Аватар</h2>
          <div className="profile-edit-avatar">
            <div className="profile-edit-avatar-preview">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar preview" />
              ) : (
                <div className="profile-edit-avatar-placeholder">
                  {formData.display_name?.[0]?.toUpperCase() || currentUser?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div className="profile-edit-avatar-controls">
              <label className="profile-edit-file-label">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="profile-edit-file-input"
                />
                {avatarPreview ? 'Изменить аватар' : 'Загрузить аватар'}
              </label>
              {avatarPreview && (
                <button
                  type="button"
                  className="profile-edit-remove-btn"
                  onClick={() => {
                    setAvatar(null);
                    setAvatarPreview(null);
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="profile-edit-section">
          <h2 className="profile-edit-section-title">Основная информация</h2>
          <div className="profile-edit-form-group">
            <label htmlFor="display_name" className="profile-edit-label">
              Отображаемое имя
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              className="profile-edit-input"
              placeholder="Ваше имя"
              maxLength={200}
            />
          </div>

          <div className="profile-edit-form-group">
            <label htmlFor="bio" className="profile-edit-label">
              Биография
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              className="profile-edit-textarea"
              placeholder="Расскажите о себе"
              rows={4}
              maxLength={500}
            />
            <div className="profile-edit-char-count">
              {formData.bio.length}/500
            </div>
          </div>

          <div className="profile-edit-form-group">
            <label htmlFor="location" className="profile-edit-label">
              Местоположение
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="profile-edit-input"
              placeholder="Город, страна"
              maxLength={200}
            />
          </div>

          <div className="profile-edit-form-group">
            <label htmlFor="website" className="profile-edit-label">
              Веб-сайт
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="profile-edit-input"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="profile-edit-section">
          <h2 className="profile-edit-section-title">Настройки приватности</h2>
          <div className="profile-edit-checkbox-group">
            <label className="profile-edit-checkbox-label">
              <input
                type="checkbox"
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
                className="profile-edit-checkbox"
              />
              <span>Сделать профиль публичным</span>
            </label>
            <p className="profile-edit-help-text">
              Публичный профиль могут просматривать все пользователи
            </p>
          </div>
        </div>

        <div className="profile-edit-actions">
          <button
            type="button"
            className="profile-edit-cancel-action-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="profile-edit-save-btn"
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
      </div>
    </Layout>
  );
};

export default ProfileEdit;
