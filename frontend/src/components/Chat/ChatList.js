import React, { useState, useEffect, useCallback } from 'react';
import { chatAPI } from '../../api/api';
import toast from 'react-hot-toast';
import { useDebounce } from '../../hooks/useDebounce';
import './ChatList.css';

const ChatList = ({ rooms, selectedRoom, onSelectRoom, onCreateRoom, currentUser, onRoomsUpdate }) => {
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ users: [], rooms: [] });
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery);
    } else {
      setSearchResults({ users: [], rooms: [] });
      setShowSearchResults(false);
    }
  }, [debouncedSearchQuery]);

  const performSearch = async (query) => {
    setSearchLoading(true);
    try {
      const response = await chatAPI.search(query);
      setSearchResults(response.data);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Ошибка поиска');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleRoomClick = (room) => {
    onSelectRoom(room);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleUserClick = async (user) => {
    try {
      const response = await chatAPI.createRoom({
        user_ids: [user.id],
        room_type: 'direct'
      });
      const newRoom = response.data;
      if (onRoomsUpdate) {
        onRoomsUpdate();
      }
      onSelectRoom(newRoom);
      setShowSearchResults(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Ошибка создания чата');
    }
  };

  const handleToggleFavorite = async (e, room) => {
    e.stopPropagation();
    try {
      await chatAPI.toggleFavorite(room.id);
      if (onRoomsUpdate) {
        onRoomsUpdate();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Ошибка при изменении избранного');
    }
  };

  const favoriteRooms = rooms.filter(room => room.is_favorite);
  const regularRooms = rooms.filter(room => !room.is_favorite);

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Чаты</h2>
        <button
          className="chat-new-btn"
          onClick={() => setShowNewChat(!showNewChat)}
          title="Новый чат"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="chat-search-container">
        <div className="chat-search-wrapper">
          <svg className="chat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            type="text"
            className="chat-search-input"
            placeholder="Поиск по ID или имени"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.trim() && (searchResults.users.length > 0 || searchResults.rooms.length > 0)) {
                setShowSearchResults(true);
              }
            }}
          />
          {searchQuery && (
            <button
              className="chat-search-clear"
              onClick={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          )}
        </div>

        {showSearchResults && (searchResults.users.length > 0 || searchResults.rooms.length > 0) && (
          <div className="chat-search-results">
            {searchResults.users.length > 0 && (
              <div className="search-results-section">
                <div className="search-results-title">Пользователи</div>
                {searchResults.users.map(user => (
                  <div
                    key={user.id}
                    className="search-result-item"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="search-result-avatar">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.display_name} />
                      ) : (
                        <span>{user.display_name?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{user.display_name}</div>
                      <div className="search-result-id">@{user.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {searchResults.rooms.length > 0 && (
              <div className="search-results-section">
                <div className="search-results-title">Чаты</div>
                {searchResults.rooms.map(room => (
                  <div
                    key={room.id}
                    className="search-result-item"
                    onClick={() => handleRoomClick(room)}
                  >
                    <div className="search-result-avatar">
                      {room.display_name?.[0]?.toUpperCase() || 'C'}
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-name">{room.display_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="chat-list-items">
        {!showSearchResults && rooms.length === 0 && (
          <div className="chat-list-empty">
            <p>Нет активных чатов</p>
            <p className="chat-list-empty-hint">Начните новый чат, нажав кнопку выше</p>
          </div>
        )}

        {!showSearchResults && favoriteRooms.length > 0 && (
          <div className="chat-list-section">
            <div className="chat-list-section-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
              </svg>
              Избранное
            </div>
            {favoriteRooms.map(room => (
              <div
                key={room.id}
                className={`chat-list-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => handleRoomClick(room)}
              >
                <div className="chat-list-item-avatar">
                  {room.display_name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="chat-list-item-content">
                  <div className="chat-list-item-header">
                    <span className="chat-list-item-name">{room.display_name}</span>
                    {room.last_message && (
                      <span className="chat-list-item-time">
                        {new Date(room.last_message.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <div className="chat-list-item-footer">
                    {room.last_message && (
                      <span className="chat-list-item-preview">
                        {room.last_message.sender === currentUser?.username ? 'Вы: ' : ''}
                        {room.last_message.content}
                      </span>
                    )}
                    {room.unread_count > 0 && (
                      <span className="chat-list-item-badge">{room.unread_count}</span>
                    )}
                  </div>
                </div>
                <button
                  className="chat-favorite-btn active"
                  onClick={(e) => handleToggleFavorite(e, room)}
                  title="Удалить из избранного"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {!showSearchResults && regularRooms.length > 0 && (
          <div className="chat-list-section">
            {favoriteRooms.length > 0 && (
              <div className="chat-list-section-title">Все чаты</div>
            )}
            {regularRooms.map(room => (
              <div
                key={room.id}
                className={`chat-list-item ${selectedRoom?.id === room.id ? 'active' : ''}`}
                onClick={() => handleRoomClick(room)}
              >
                <div className="chat-list-item-avatar">
                  {room.display_name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className="chat-list-item-content">
                  <div className="chat-list-item-header">
                    <span className="chat-list-item-name">{room.display_name}</span>
                    {room.last_message && (
                      <span className="chat-list-item-time">
                        {new Date(room.last_message.created_at).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                  <div className="chat-list-item-footer">
                    {room.last_message && (
                      <span className="chat-list-item-preview">
                        {room.last_message.sender === currentUser?.username ? 'Вы: ' : ''}
                        {room.last_message.content}
                      </span>
                    )}
                    {room.unread_count > 0 && (
                      <span className="chat-list-item-badge">{room.unread_count}</span>
                    )}
                  </div>
                </div>
                <button
                  className="chat-favorite-btn"
                  onClick={(e) => handleToggleFavorite(e, room)}
                  title="Добавить в избранное"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
