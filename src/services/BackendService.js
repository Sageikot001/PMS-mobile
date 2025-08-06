import { Alert } from 'react-native';

// Backend API configuration
const API_BASE_URL = 'http://10.0.2.2:3000/api'; // For Android emulator
// const API_BASE_URL = 'http://localhost:3000/api'; // For iOS simulator
// const API_BASE_URL = 'http://10.0.2.2:5000/api'; // If backend runs on port 5000
// const API_BASE_URL = 'http://10.0.2.2:3000'; // If no /api prefix
// const API_BASE_URL = 'http://your-computer-ip:3000/api'; // For physical device

const API_ENDPOINTS = {
  APPOINTMENTS: '/appointments',
  USERS: '/users',
  NOTIFICATIONS: '/notifications',
  AUTH: '/auth',
  HEALTH: '/health',
};

/**
 * Backend Service for MongoDB integration
 * Handles all API calls to the backend server
 */
class BackendService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = null;
    this.currentUser = null;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token) {
    this.authToken = token;
  }

  /**
   * Set current user
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }

  /**
   * Get headers for API requests
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    
    return headers;
  }

  /**
   * Make API request with error handling
   */
  async makeRequest(endpoint, options = {}) {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config = {
        headers: this.getHeaders(),
        timeout: 10000, // 10 second timeout
        ...options,
      };

      console.log('🌐 Backend API Request:', {
        url,
        method: config.method || 'GET',
        body: config.body ? JSON.parse(config.body) : undefined,
        timeout: config.timeout
      });

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🌐 Backend API Response:', { endpoint, status: response.status, data });
      
      return data;
    } catch (error) {
      console.error('🌐 Backend API Error:', { 
        endpoint, 
        error: error.message,
        url: `${this.baseURL}${endpoint}`,
        networkError: error.message.includes('Network request failed'),
        timeoutError: error.name === 'AbortError' || error.message.includes('timeout')
      });
      
      // Provide more specific error messages
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error(`Backend server timeout. Server at ${this.baseURL} is not responding within 10 seconds.`);
      }
      
      if (error.message.includes('Network request failed')) {
        throw new Error(`Backend server not reachable. Please check if the server is running at ${this.baseURL}`);
      }
      
      throw error;
    }
  }

  // ===== APPOINTMENT ENDPOINTS =====

  /**
   * Get all appointments for current user
   */
  async getAppointments() {
    const endpoint = `${API_ENDPOINTS.APPOINTMENTS}/my-appointments`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId) {
    const endpoint = `${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Create new appointment
   */
  async createAppointment(appointmentData) {
    const endpoint = API_ENDPOINTS.APPOINTMENTS;
    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(appointmentId, status, notes = '') {
    const endpoint = `${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/status`;
    return await this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(appointmentId, newDate, newTime, reason = '') {
    const endpoint = `${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/reschedule`;
    return await this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ newDate, newTime, reason }),
    });
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, reason = '') {
    const endpoint = `${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/cancel`;
    return await this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Create reschedule request
   */
  async createRescheduleRequest(appointmentId, newDate, newTime, reason = '') {
    const endpoint = `${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/reschedule-request`;
    return await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ newDate, newTime, reason }),
    });
  }

  /**
   * Handle reschedule request (approve/reject)
   */
  async handleRescheduleRequest(appointmentId, approved, notes = '') {
    const endpoint = `${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/reschedule-request`;
    return await this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify({ approved, notes }),
    });
  }

  // ===== NOTIFICATION ENDPOINTS =====

  /**
   * Get notifications for current user
   */
  async getNotifications() {
    const endpoint = `${API_ENDPOINTS.NOTIFICATIONS}/my-notifications`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    const endpoint = `${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`;
    return await this.makeRequest(endpoint, {
      method: 'PATCH',
    });
  }

  // ===== USER ENDPOINTS =====

  /**
   * Get user profile
   */
  async getUserProfile() {
    const endpoint = `${API_ENDPOINTS.USERS}/profile`;
    return await this.makeRequest(endpoint);
  }

  /**
   * Update user profile
   */
  async updateUserProfile(profileData) {
    const endpoint = `${API_ENDPOINTS.USERS}/profile`;
    return await this.makeRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // ===== AUTH ENDPOINTS =====

  /**
   * Login user
   */
  async login(credentials) {
    const endpoint = `${API_ENDPOINTS.AUTH}/login`;
    const response = await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * Register user
   */
  async register(userData) {
    const endpoint = `${API_ENDPOINTS.AUTH}/register`;
    const response = await this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      this.setAuthToken(response.token);
    }
    
    return response;
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const endpoint = `${API_ENDPOINTS.AUTH}/logout`;
      await this.makeRequest(endpoint, { method: 'POST' });
    } catch (error) {
      console.log('Logout error (non-critical):', error.message);
    } finally {
      this.authToken = null;
      this.currentUser = null;
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Test backend connectivity
   */
  async testConnection() {
    try {
      // Try the root endpoint first
      console.log('🌐 Testing backend connectivity...');
      
      // Test 1: Try root endpoint
      try {
        const rootResponse = await this.makeRequest('');
        console.log('✅ Backend root endpoint accessible:', rootResponse);
        return true;
      } catch (rootError) {
        console.log('⚠️ Root endpoint failed, trying /health...');
      }
      
      // Test 2: Try health endpoint
      try {
        const healthResponse = await this.makeRequest(API_ENDPOINTS.HEALTH);
        console.log('✅ Backend health endpoint accessible:', healthResponse);
        return true;
      } catch (healthError) {
        console.log('⚠️ Health endpoint failed, trying /appointments...');
      }
      
      // Test 3: Try appointments endpoint
      try {
        const appointmentsResponse = await this.makeRequest(API_ENDPOINTS.APPOINTMENTS);
        console.log('✅ Backend appointments endpoint accessible');
        return true;
      } catch (appointmentsError) {
        console.log('❌ All endpoints failed');
        throw new Error('Backend server is not responding to any endpoints');
      }
      
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  }

  /**
   * Sync local data with backend
   */
  async syncData() {
    try {
      console.log('🔄 Starting data sync with backend...');
      
      // Test connection first
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Backend not available');
      }

      // Sync appointments
      const appointments = await this.getAppointments();
      console.log('✅ Appointments synced:', appointments.length);

      // Sync notifications
      const notifications = await this.getNotifications();
      console.log('✅ Notifications synced:', notifications.length);

      return { appointments, notifications };
    } catch (error) {
      console.error('❌ Data sync failed:', error.message);
      throw error;
    }
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      connected: !!this.authToken,
      baseURL: this.baseURL,
      currentUser: this.currentUser ? this.currentUser.id : null,
      hasToken: !!this.authToken,
    };
  }
}

export default new BackendService(); 