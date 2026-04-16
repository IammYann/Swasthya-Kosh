import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { accessToken } = response.data;
          
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          
          return api(originalRequest);
        } catch (err) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Email Notification APIs
export const emailNotificationAPI = {
  // Send welcome email (public - no authentication)
  sendWelcomeEmail: (email) => api.post('/notifications/send-welcome-email', { email }),
  
  // Send test email to user's account
  sendTestEmail: () => api.post('/notifications/send-test-email'),
  
  // Get email preferences
  getEmailPreferences: () => api.get('/notifications/preferences/email'),
  
  // Update email preferences
  updateEmailPreferences: (preferences) => api.patch('/notifications/preferences/email', preferences),
  
  // Manual trigger: check budget alerts
  checkBudgetAlerts: () => api.post('/notifications/check/budget-alerts'),
  
  // Manual trigger: check goal achievements
  checkGoalAchievements: () => api.post('/notifications/check/goal-achievements'),
  
  // Manual trigger: send daily digest
  sendDailyDigest: () => api.post('/notifications/digest/daily'),
  
  // Manual trigger: send weekly digest
  sendWeeklyDigest: () => api.post('/notifications/digest/weekly'),
};

export default api;
