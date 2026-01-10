import React, { useState, useEffect } from 'react';
import { chatAPI } from '../../api/api';
import { useAuth } from '../../contexts/AuthContext';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import Layout from '../Layout/Layout';
import './ChatInterface.css';

const ChatInterface = () => {
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await chatAPI.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    // Отмечаем сообщения как прочитанные
    if (room.id) {
      chatAPI.markAsRead(room.id).catch(console.error);
    }
  };

  const handleCreateRoom = async (userIds, roomType = 'direct') => {
    try {
      const response = await chatAPI.createRoom({
        user_ids: userIds,
        room_type: roomType,
      });
      const newRoom = response.data;
      setRooms([newRoom, ...rooms]);
      setSelectedRoom(newRoom);
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  };

  const handleNewMessage = () => {
    // Обновляем список комнат при новом сообщении
    loadRooms();
  };

  const handleRoomsUpdate = () => {
    loadRooms();
  };

  if (loading) {
    return (
      <Layout>
        <div className="chat-loading">Загрузка чатов...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="chat-interface">
      <ChatList
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={handleSelectRoom}
        onCreateRoom={handleCreateRoom}
        currentUser={user}
        onRoomsUpdate={handleRoomsUpdate}
      />
      {selectedRoom ? (
        <ChatWindow
          room={selectedRoom}
          onNewMessage={handleNewMessage}
          currentUser={user}
        />
      ) : (
        <div className="chat-placeholder">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>Выберите чат для начала общения</p>
        </div>
      )}
      </div>
    </Layout>
  );
};

export default ChatInterface;
