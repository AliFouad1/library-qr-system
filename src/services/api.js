/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (data) =>
    api.post('/auth/register', data),
  getCurrentUser: () =>
    api.get('/auth/me')
};

// Books API
export const booksAPI = {
  getAll: (params) =>
    api.get('/books', { params }),
  getById: (id) =>
    api.get(`/books/${id}`),
  create: (data) =>
    api.post('/books', data),
  update: (id, data) =>
    api.put(`/books/${id}`, data),
  delete: (id) =>
    api.delete(`/books/${id}`),
  regenerateQR: (id) =>
    api.post(`/books/${id}/regenerate-qr`),
  getStats: () =>
    api.get('/books/stats')
};

// QR API
export const qrAPI = {
  scanBook: (data) =>
    api.post('/qr/scan/book', data),
  scanShelf: (data) =>
    api.post('/qr/scan/shelf', data),
  validate: (qrData) =>
    api.post('/qr/validate', { qrData })
};

// Borrowing API
export const borrowingAPI = {
  borrow: (data) =>
    api.post('/borrowing/borrow', data),
  return: (borrowingId) =>
    api.post(`/borrowing/return/${borrowingId}`),
  getAll: (params) =>
    api.get('/borrowing', { params }),
  getUserBorrowings: (userId, params) =>
    api.get(`/borrowing/user/${userId}`, { params }),
  getOverdue: () =>
    api.get('/borrowing/overdue'),
  extend: (borrowingId, additionalDays) =>
    api.put(`/borrowing/${borrowingId}/extend`, { additionalDays }),
  getStats: () =>
    api.get('/borrowing/stats')
};

// Categories API
export const categoriesAPI = {
  getAll: () =>
    api.get('/categories'),
  create: (data) =>
    api.post('/categories', data),
  update: (id, data) =>
    api.put(`/categories/${id}`, data),
  delete: (id) =>
    api.delete(`/categories/${id}`)
};

// Shelves API
export const shelvesAPI = {
  getAll: () =>
    api.get('/shelves'),
  getById: (id) =>
    api.get(`/shelves/${id}`),
  create: (data) =>
    api.post('/shelves', data),
  update: (id, data) =>
    api.put(`/shelves/${id}`, data),
  delete: (id) =>
    api.delete(`/shelves/${id}`)
};

// Reports API
export const reportsAPI = {
  getDashboard: () =>
    api.get('/reports/dashboard'),
  getMostBorrowed: () =>
    api.get('/reports/most-borrowed')
};

// Notifications API
export const notificationsAPI = {
  getAll: () =>
    api.get('/notifications'),
  markAsRead: (id) =>
    api.put(`/notifications/${id}/read`)
};

// Users API
export const usersAPI = {
  getAll: () =>
    api.get('/users'),
  getById: (id) =>
    api.get(`/users/${id}`)
};

export default api;
