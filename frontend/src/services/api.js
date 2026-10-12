import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Attach auth token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bookbridge_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized response error formatting
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || error.response?.data?.error || error.message || 'API request failed';
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  // Auth
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: (userId) => apiClient.post('/auth/logout', null, { params: { userId } }),
  getActiveSession: () => apiClient.get('/auth/session'),

  // Snapshot & Home
  getCommunitySnapshot: () => apiClient.get('/users/snapshot'),
  getFeaturedBooks: () => apiClient.get('/books/featured'),

  // Books
  getBooks: (params = {}) => apiClient.get('/books', { params }),
  getBookById: (id) => apiClient.get(`/books/${id}`),
  createBook: (data) => apiClient.post('/books', data),
  updateBook: (id, data) => apiClient.put(`/books/${id}`, data),
  deleteBook: (id, ownerId) => apiClient.delete(`/books/${id}`, { params: { ownerId } }),

  // Borrow Requests
  requestBook: (bookId, data) => apiClient.post(`/books/${bookId}/request`, data),
  approveRequest: (id, ownerId) => apiClient.put(`/requests/${id}/approve`, null, { params: { ownerId } }),
  rejectRequest: (id, ownerId) => apiClient.put(`/requests/${id}/reject`, null, { params: { ownerId } }),
  markReturned: (id, ownerId) => apiClient.put(`/requests/${id}/return`, null, { params: { ownerId } }),

  // User & Stats
  getUserProfile: (id) => apiClient.get(`/users/${id}`),
  updateUserProfile: (id, data) => apiClient.put(`/users/${id}`, data),
  getUserStatistics: (id) => apiClient.get(`/users/${id}/statistics`),
  getUserRequests: (id, type) => apiClient.get(`/users/${id}/requests`, { params: type ? { type } : {} }),
  getUserReviews: (id) => apiClient.get(`/users/${id}/reviews`),
  getUserBooks: (id) => apiClient.get(`/users/${id}/books`),

  // Reviews
  submitReview: (requestId, data) => apiClient.post(`/requests/${requestId}/review`, data)
};

export default api;
