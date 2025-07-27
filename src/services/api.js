import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if it's not a login/register request
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login') && 
        !error.config?.url?.includes('/auth/register') &&
        !error.config?.url?.includes('/auth/verify')) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    
    const message = error.response?.data?.message || 'An error occurred';
    // Don't show toast for auth errors on login/register pages
    if (!(error.config?.url?.includes('/auth/') && error.response?.status === 401)) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const userAPI = {
  // Get all users
  getAllUsers: (params = {}) => api.get('/users/all', { params }),
  
  // Search users
  searchUsers: (query, limit = 10) => api.get('/users/search', { 
    params: { q: query, limit } 
  }),
  
  // Get current user profile
  getCurrentUser: () => api.get('/users/me'),
  
  // Get user profile by ID
  getUserProfile: (userId) => api.get(`/users/profile/${userId}`),
  
  // Update user profile
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Get online users
  getOnlineUsers: () => api.get('/users/online'),
  
  // Update user settings
  updateSettings: (settings) => api.put('/users/settings', settings),
};

export const chatAPI = {
  // Get all chats for current user
  getChats: () => api.get('/chats'),
  
  // Get chat by ID
  getChat: (chatId) => api.get(`/chats/${chatId}`),
  
  // Create new chat (both private and group)
  createChat: (data) => api.post('/chats', data),
  
  // Create group chat (alias for createChat with type: 'group')
  createGroupChat: (data) => api.post('/chats', { ...data, type: 'group' }),
  
  // Update chat
  updateChat: (chatId, data) => api.put(`/chats/${chatId}`, data),
  
  // Add members to group chat
  addMembers: (chatId, userIds) => api.post(`/chats/${chatId}/participants`, { participants: userIds }),
  
  // Remove member from group chat
  removeMember: (chatId, userId) => api.delete(`/chats/${chatId}/participants/${userId}`),
  
  // Leave chat
  leaveChat: (chatId) => api.post(`/chats/${chatId}/leave`),
};

export const messageAPI = {
  // Get messages for a chat
  getMessages: (chatId, params = {}) => api.get(`/messages/${chatId}`, { params }),
  
  // Send message
  sendMessage: (data) => api.post(`/messages/${data.chat}`, data),
  
  // Edit message
  editMessage: (messageId, content) => api.put(`/messages/${messageId}`, { content }),
  
  // Delete message
  deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
  
  // Add reaction to message
  addReaction: (messageId, emoji) => api.post(`/messages/${messageId}/reactions`, { emoji }),
  
  // Remove reaction from message
  removeReaction: (messageId, emoji) => api.delete(`/messages/${messageId}/reactions/${emoji}`),
  
  // Mark messages as read
  markAsRead: (messageIds) => api.post('/messages/read', { messageIds }),
};

export const friendAPI = {
  // Send friend request
  sendRequest: (userId) => api.post('/friends/request', { userId }),
  
  // Accept friend request
  acceptRequest: (userId) => api.post('/friends/accept', { userId }),
  
  // Decline friend request
  declineRequest: (userId) => api.post('/friends/decline', { userId }),
  
  // Get friends list
  getFriends: () => api.get('/friends'),
  
  // Get friend requests
  getRequests: () => api.get('/friends/requests'),
};

export default api;