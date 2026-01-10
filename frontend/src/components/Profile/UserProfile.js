import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { profileAPI } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import PublicNotes from './PublicNotes';
import Layout from '../Layout/Layout';
import './UserProfile.css';

const UserProfile = () => {
  const { user_id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    loadProfile();
  }, [user_id]);

  const loadProfile = async () => {
    try {
      const userId = user_id || currentUser?.id;
      if (!userId) {
        navigate('/');
        return;
      }
      const response = await profileAPI.getUserProfile(userId);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Ошибка загрузки профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.is_following) {
        await profileAPI.unfollowUser(profile.user_id);
        setProfile({ ...profile, is_following: false, followers_count: profile.followers_count - 1 });
        toast.success('Вы отписались');
      } else {
        await profileAPI.followUser(profile.user_id);
        setProfile({ ...profile, is_following: true, followers_count: profile.followers_count + 1 });
        toast.success('Вы подписались');
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Ошибка при подписке');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="profile-loading">Загрузка профиля...</div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="profile-error">Профиль не найден</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="user-profile">
      <div className="profile-header">
        {profile.cover_image && (
          <div className="profile-cover" style={{ backgroundImage: `url(${profile.cover_image})` }} />
        )}
        <div className="profile-info">
          <div className="profile-avatar-container">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.display_name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {profile.display_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
          <div className="profile-details">
            <h1 className="profile-name">{profile.display_name || profile.username}</h1>
            {profile.bio && <p className="profile-bio">{profile.bio}</p>}
            <div className="profile-meta">
              {profile.location && (
                <span className="profile-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {profile.location}
                </span>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="profile-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 14L21 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {profile.website}
                </a>
              )}
            </div>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="stat-value">{profile.followers_count || 0}</span>
                <span className="stat-label">Подписчиков</span>
              </div>
              <div className="profile-stat">
                <span className="stat-value">{profile.following_count || 0}</span>
                <span className="stat-label">Подписок</span>
              </div>
            </div>
            {!profile.is_own_profile && (
              <button className="profile-follow-btn" onClick={handleFollow}>
                {profile.is_following ? 'Отписаться' : 'Подписаться'}
              </button>
            )}
            {profile.is_own_profile && (
              <button 
                className="profile-edit-btn" 
                onClick={() => navigate('/profile/edit')}
              >
                Редактировать профиль
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Публичные заметки
        </button>
        <button
          className={`profile-tab ${activeTab === 'followers' ? 'active' : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Подписчики
        </button>
        <button
          className={`profile-tab ${activeTab === 'following' ? 'active' : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Подписки
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'notes' && (
          <PublicNotes userId={profile.user_id} />
        )}
        {activeTab === 'followers' && (
          <div className="profile-list">
            {/* Список подписчиков будет здесь */}
          </div>
        )}
        {activeTab === 'following' && (
          <div className="profile-list">
            {/* Список подписок будет здесь */}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
};

export default UserProfile;


