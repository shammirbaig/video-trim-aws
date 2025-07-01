import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 1000000, // Increased timeout for video processing
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Wait for Clerk to be available
      if (typeof window !== 'undefined' && window.Clerk) {
        // Ensure Clerk is loaded
        await window.Clerk.load();
        
        if (window.Clerk.session) {
          const token = await window.Clerk.session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      console.warn('Unauthorized access, redirecting to home');
      window.location.href = '/';
    } else if (error.response?.status === 403) {
      if (error.response.data?.code === 'SUBSCRIPTION_REQUIRED') {
        console.warn('Subscription required, redirecting to subscribe page');
        window.location.href = '/subscribe';
      }
    }
    
    return Promise.reject(new Error(message));
  }
);

// API methods
export const videoAPI = {
  // Validate YouTube URL
  validateUrl: async (url) => {
    const response = await api.get('/videos/validate', {
      params: { url }
    });
    return response.data;
  },

  // Start video trimming
  trimVideo: async (data) => {
    const response = await api.post('/videos/trim', data);
    return response.data;
  },

  // Get processing status
  getStatus: async (videoId) => {
    const response = await api.get(`/videos/${videoId}/status`);
    return response.data;
  },

  // Get download URL
  getDownloadUrl: async (videoId) => {
    const response = await api.get(`/videos/${videoId}/download`);
    return response.data;
  },

  // Get video history
  getHistory: async (params = {}) => {
    const response = await api.get('/videos/history', { params });
    return response.data;
  },

  // Delete video
  deleteVideo: async (videoId) => {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  }
};

export const authAPI = {
  // Get current user
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Get subscription status
  getSubscription: async () => {
    const response = await api.get('/auth/subscription');
    return response.data;
  }
};

export default api;