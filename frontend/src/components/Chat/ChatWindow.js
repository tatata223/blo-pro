import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import './ChatWindow.css';

const ChatWindow = ({ room, onNewMessage, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    if (room?.id) {
      loadMessages();
      // Запускаем polling для обновления сообщений каждые 2 секунды
      pollingIntervalRef.current = setInterval(() => {
        loadMessages();
      }, 2000);
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [room?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await chatAPI.getMessages(room.id);
      const newMessages = response.data.reverse();
      // Обновляем только если есть новые сообщения
      setMessages(prev => {
        if (prev.length !== newMessages.length || 
            prev[prev.length - 1]?.id !== newMessages[newMessages.length - 1]?.id) {
          return newMessages;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error loading messages:', error);
      if (loading) {
        toast.error('Ошибка загрузки сообщений');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 10 МБ');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    const messageContent = newMessage.trim();
    setNewMessage('');

    try {
      const formData = new FormData();
      if (messageContent) {
        formData.append('content', messageContent);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
        formData.append('message_type', selectedFile.type.startsWith('image/') ? 'image' : 'file');
      }

      await chatAPI.sendMessage(room.id, formData, true);
      
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Обновляем сообщения сразу после отправки
      await loadMessages();
      onNewMessage();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Ошибка отправки сообщения');
      setNewMessage(messageContent); // Восстанавливаем текст
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-window-loading">Загрузка сообщений...</div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-window-header">
        <h3>{room.display_name}</h3>
        <div className="chat-window-meta">
          {room.members_count && (
            <span>{room.members_count} участников</span>
          )}
        </div>
      </div>

      <div className="chat-window-messages">
        {messages.length === 0 ? (
          <div className="chat-window-empty">
            <p>Нет сообщений</p>
            <p className="chat-window-empty-hint">Начните общение, отправив первое сообщение</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`chat-message ${message.sender.id === currentUser?.id ? 'own' : ''}`}
            >
              {message.sender.id !== currentUser?.id && (
                <div className="chat-message-avatar">
                  {message.sender.username[0].toUpperCase()}
                </div>
              )}
              <div className="chat-message-content">
                {message.sender.id !== currentUser?.id && (
                  <div className="chat-message-sender">{message.sender.username}</div>
                )}
                <div className="chat-message-bubble">
                  {message.content}
                  {message.file && (
                    <div className="chat-message-file">
                      <a 
                        href={message.file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="chat-file-link"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', marginRight: '6px', verticalAlign: 'middle' }}>
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {message.file_name || 'Файл'}
                      </a>
                    </div>
                  )}
                </div>
                <div className="chat-message-time">
                  {new Date(message.created_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-window-input">
        {selectedFile && (
          <div className="chat-file-preview">
            <span>{selectedFile.name}</span>
            <button 
              type="button" 
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="chat-file-remove"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            className="chat-attach-btn"
            title="Прикрепить файл"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.44 11.05L12.25 20.24C11.1242 21.3658 9.59718 21.9983 8.005 21.9983C6.41282 21.9983 4.88584 21.3658 3.76 20.24C2.63416 19.1142 2.00171 17.5872 2.00171 15.995C2.00171 14.4028 2.63416 12.8758 3.76 11.75L12.95 2.56C13.7006 1.80944 14.7186 1.38778 15.78 1.38778C16.8414 1.38778 17.8594 1.80944 18.61 2.56C19.3606 3.31056 19.7822 4.32856 19.7822 5.39C19.7822 6.45144 19.3606 7.46944 18.61 8.22L9.41 17.41C9.03473 17.7853 8.52573 17.9961 7.995 17.9961C7.46427 17.9961 6.95527 17.7853 6.58 17.41C6.20473 17.0347 5.99393 16.5257 5.99393 15.995C5.99393 15.4643 6.20473 14.9553 6.58 14.58L15.07 6.09" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Введите сообщение..."
            className="chat-input"
          />
          <button type="submit" className="chat-send-btn" disabled={!newMessage.trim() && !selectedFile}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
