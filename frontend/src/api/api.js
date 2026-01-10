import axios from 'axios';

// Используем относительный путь для работы на одном порту
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Перенаправление на страницу входа при 401
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API методы для заметок
export const notesAPI = {
  getAll: (params) => api.get('/notes/', { params }),
  getById: (id) => api.get(`/notes/${id}/`),
  create: (data, isFormData = false) => {
    if (isFormData) {
      return api.post('/notes/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post('/notes/', data);
  },
  update: (id, data, isFormData = false) => {
    if (isFormData) {
      return api.put(`/notes/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.put(`/notes/${id}/`, data);
  },
  delete: (id) => api.delete(`/notes/${id}/`),
  pin: (id) => api.post(`/notes/${id}/pin/`),
  archive: (id) => api.post(`/notes/${id}/archive/`),
  createFromTemplate: (templateId) => api.post('/notes/create_from_template/', { template_id: templateId }),
  moveToFolder: (id, folderId) => api.post(`/notes/${id}/move_to_folder/`, { folder_id: folderId }),
  encrypt: (id, data) => api.post(`/notes/${id}/encrypt/`, data),
  decrypt: (id, data) => api.post(`/notes/${id}/decrypt/`, data),
  removeEncryption: (id, data) => api.post(`/notes/${id}/remove_encryption/`, data),
};

// API методы для шаблонов
export const templatesAPI = {
  getAll: () => api.get('/templates/'),
  getById: (id) => api.get(`/templates/${id}/`),
};

// API методы для папок
export const foldersAPI = {
  getAll: (params) => api.get('/folders/', { params }),
  getById: (id) => api.get(`/folders/${id}/`),
  create: (data) => api.post('/folders/', data),
  update: (id, data) => api.put(`/folders/${id}/`, data),
  delete: (id) => api.delete(`/folders/${id}/`),
  getTree: () => api.get('/folders/tree/'),
  toggleFavorite: (id) => api.post(`/folders/${id}/toggle_favorite/`),
};

// API методы для тегов
export const tagsAPI = {
  getAll: (params) => api.get('/tags/', { params }),
  getById: (id) => api.get(`/tags/${id}/`),
  create: (data) => api.post('/tags/', data),
  update: (id, data) => api.put(`/tags/${id}/`, data),
  delete: (id) => api.delete(`/tags/${id}/`),
  getCloud: () => api.get('/tags/cloud/'),
  autocomplete: (query) => api.get('/tags/autocomplete/', { params: { q: query } }),
  getStatistics: () => api.get('/tags/statistics/'),
};

// API методы для аутентификации
export const authAPI = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  logout: () => api.post('/auth/logout/'),
  register: (data) => api.post('/auth/register/', data),
  getCurrentUser: () => api.get('/auth/user/'),
};

// Исправление метода создания заметки из шаблона
notesAPI.createFromTemplate = (templateId) => 
  api.post('/notes/create_from_template/', { template_id: templateId });

// API методы для статистики
export const statisticsAPI = {
  getUserStatistics: () => api.get('/users/statistics/'),
  getUserRating: () => api.get('/users/rating/'),
  startTypingSession: (noteId) => api.post('/typing-sessions/start/', { note_id: noteId }),
  endTypingSession: (sessionId, data) => api.post('/typing-sessions/end/', { session_id: sessionId, ...data }),
  sendKeystroke: (sessionId, data) => api.post('/typing-sessions/keystroke/', { session_id: sessionId, ...data }),
};

// API методы для экспорта
notesAPI.exportPDF = (id) => api.post(`/notes/${id}/export_pdf/`, {}, { responseType: 'blob' });
notesAPI.exportEmail = (id, data) => api.post(`/notes/${id}/export_email/`, data);
notesAPI.exportTelegram = (id, data) => api.post(`/notes/${id}/export_telegram/`, data);
notesAPI.exportWhatsApp = (id) => api.post(`/notes/${id}/export_whatsapp/`, {}, { responseType: 'blob' });

// API методы для профиля
export const profileAPI = {
  getUserProfile: (userId) => api.get(`/users/${userId}/profile/`),
  updateProfile: (data) => {
    // Если data - это FormData, не устанавливаем Content-Type заголовок
    const isFormData = data instanceof FormData;
    return api.put('/users/profile/', data, {
      headers: isFormData ? {} : { 'Content-Type': 'application/json' }
    });
  },
  getPublicNotes: (userId) => api.get(`/users/${userId}/notes/public/`),
  followUser: (userId) => api.post(`/users/${userId}/follow/`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow/`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers/`),
  getFollowing: (userId) => api.get(`/users/${userId}/following/`),
  getSettings: () => api.get('/users/settings/'),
  updateSettings: (data) => api.put('/users/settings/', data),
};

// API методы для чата
export const chatAPI = {
  getRooms: () => api.get('/chat/rooms/'),
  createRoom: (data) => api.post('/chat/rooms/create/', data),
  getRoomDetail: (roomId) => api.get(`/chat/rooms/${roomId}/`),
  getMessages: (roomId) => api.get(`/chat/rooms/${roomId}/messages/`),
  sendMessage: (roomId, data, isFormData = false) => {
    if (isFormData) {
      return api.post(`/chat/rooms/${roomId}/send/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    return api.post(`/chat/rooms/${roomId}/send/`, data);
  },
  markAsRead: (roomId) => api.post(`/chat/rooms/${roomId}/read/`),
  search: (query) => api.get('/chat/search/', { params: { q: query } }),
  toggleFavorite: (roomId) => api.post(`/chat/rooms/${roomId}/toggle_favorite/`),
};

// API методы для маркетплейса
export const marketplaceAPI = {
  getItems: (params) => api.get('/marketplace/', { params }),
  getItemDetail: (itemId) => api.get(`/marketplace/${itemId}/`),
  purchaseItem: (itemId) => api.post(`/marketplace/${itemId}/purchase/`),
  uploadItem: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/marketplace/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// API методы для валюты
export const currencyAPI = {
  getBalance: () => api.get('/currency/balance/'),
  getTransactions: () => api.get('/currency/transactions/'),
  earn: (data) => api.post('/currency/earn/', data),
};

// API методы для заданий
export const tasksAPI = {
  getDailyTasks: (type) => api.get('/tasks/daily/', { params: { type } }),
  completeTask: (taskId) => api.post(`/tasks/${taskId}/complete/`),
};

// API методы для огоньков
export const firefliesAPI = {
  getFireflies: () => api.get('/fireflies/'),
  sendFirefly: (data) => api.post('/fireflies/send/', data),
  getUserStreak: (userId) => api.get(`/users/${userId}/streak/`),
  checkStreak: () => api.post('/users/check-streak/'),
};

