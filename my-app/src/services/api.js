// src/services/api.js
import axios from 'axios';

// The base URL for your back-end server
const API_URL = 'http://localhost:3001/api';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
});

// --- THIS IS THE MOST IMPORTANT PART ---
// Create an "interceptor" that adds the auth token to every request.
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from local storage
    const token = localStorage.getItem('token');
    
    if (token) {
      // If the token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// --- AUTH ---
export const loginUser = (credentials) => {
  return apiClient.post('/login', credentials);
};
export const registerUser = (userData) => {
  return apiClient.post('/register', userData);
};

// --- POSTS ---
export const getPosts = (sortOrder = 'latest') => {
  return apiClient.get(`/posts?sort=${sortOrder}`);
};
export const createPost = (postData) => {
  return apiClient.post('/posts', postData);
};
export const getHashtagsForPost = (postId) => {
  return apiClient.get(`/posts/${postId}/hashtags`);
};

// --- COMMENTS ---
export const getCommentsForPost = (postId) => {
  return apiClient.get(`/posts/${postId}/comments`);
};
export const addCommentToPost = (postId, commentData) => {
  return apiClient.post(`/posts/${postId}/comments`, commentData);
};

// --- PROFILE & CONNECTIONS ---
export const getUserProfile = (userId) => {
  return apiClient.get(`/users/${userId}`);
};
export const getConnectionCount = (userId) => {
  return apiClient.get(`/users/${userId}/connections`);
};
export const getConnections = () => {
  return apiClient.get('/connections');
};
export const getAllUsersWithStatus = () => {
  return apiClient.get('/connections/all');
};
export const sendConnectionRequest = (receiverId) => {
  return apiClient.post('/connections/request', { receiverId });
};
export const acceptConnectionRequest = (requesterId) => {
  return apiClient.post('/connections/accept', { requesterId });
};

// --- MESSAGING ---
export const getConversations = () => {
  return apiClient.get('/messages/conversations');
};
export const getMessages = (otherUserId) => {
  return apiClient.get(`/messages/${otherUserId}`);
};
export const sendMessage = (messageData) => {
  return apiClient.post('/messages', messageData);
};

// =================================================================
// === SEARCH ENDPOINT (from previous step) ===
// =================================================================
export const searchUsers = (query) => {
  return apiClient.get(`/search/users?q=${query}`);
};

// =================================================================
// === JOB ENDPOINTS (UPDATED) ===
// =================================================================
export const getJobs = () => {
  return apiClient.get('/jobs');
};

export const createJob = (jobData) => {
  // jobData will contain { title, company, location, description }
  return apiClient.post('/jobs', jobData);
};