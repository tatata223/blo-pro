import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем localStorage для быстрой загрузки
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      if (response && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      } else {
        setUser(null);
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.log('Auth check failed:', error);
      setUser(null);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      // Устанавливаем пользователя сразу из ответа
      if (response && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setLoading(false);
        return response.data;
      } else {
        // Если нет данных в ответе, проверяем через checkAuth
        await checkAuth();
        return user;
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      // Устанавливаем пользователя сразу из ответа
      if (response && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        setLoading(false);
        return response.data;
      } else {
        // Если нет данных в ответе, проверяем через checkAuth
        await checkAuth();
        return user;
      }
    } catch (error) {
      setUser(null);
      localStorage.removeItem('user');
      setLoading(false);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

