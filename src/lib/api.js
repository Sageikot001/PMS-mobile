// API service functionality is inlined below
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL, ENDPOINTS } from '../config/api';
import { dummyAuthResponse } from '../data/dummyUser';
import { isDevelopment, ENV } from '../config/env';

// Core API Client (inlined from ApiService)
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

const STATUS_CODES = {
  SUCCESS: '10000',
  FAILURE: '10001',
  RETRY: '10002',
  INVALID_ACCESS_TOKEN: '10003',
};

let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': ENV.X_API_KEY,
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Request Data:', config.data);
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (__DEV__) {
      console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, error.response?.data || error.message);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          const { token } = response.data;
          
          await AsyncStorage.setItem(TOKEN_KEY, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      if (logoutCallback) {
        logoutCallback();
      }
      return Promise.reject(error);
    }
    
    return Promise.reject(new ApiError(error));
  }
);

export class ApiError extends Error {
  constructor(axiosError) {
    const message = axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred';
    super(message);
    
    this.name = 'ApiError';
    this.status = axiosError.response?.status;
    this.statusText = axiosError.response?.statusText;
    this.data = axiosError.response?.data;
    this.isRetryable = this.status >= 500 || this.status === 429;
    
    if (axiosError.code === 'ECONNABORTED') {
      this.errorCode = 'TIMEOUT';
      this.isRetryable = true;
    } else if (axiosError.code === 'NETWORK_ERROR' || !axiosError.response) {
      this.errorCode = 'NETWORK_ERROR';
      this.isRetryable = true;
    } else if (this.status === 401) {
      this.errorCode = 'SESSION_EXPIRED';
      this.isRetryable = false;
    }
  }
}

export const get = async (endpoint, params = {}, options = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params, ...options });
    return response.data;
  } catch (error) {
    handleApiError(error, `GET ${endpoint}`);
    throw error;
  }
};

export const post = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await apiClient.post(endpoint, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error, `POST ${endpoint}`);
    throw error;
  }
};

export const put = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await apiClient.put(endpoint, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error, `PUT ${endpoint}`);
    throw error;
  }
};

export const patch = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await apiClient.patch(endpoint, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error, `PATCH ${endpoint}`);
    throw error;
  }
};

export const del = async (endpoint, params = {}, options = {}) => {
  try {
    const response = await apiClient.delete(endpoint, { params, ...options });
    return response.data;
  } catch (error) {
    handleApiError(error, `DELETE ${endpoint}`);
    throw error;
  }
};

const handleApiError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);
  
  if (error.errorCode === 'NETWORK_ERROR') {
    Alert.alert('Network Error', 'Please check your internet connection and try again.');
  } else if (error.errorCode === 'SESSION_EXPIRED') {
    Alert.alert('Session Expired', 'Please login again to continue.');
  } else if (error.isRetryable) {
    Alert.alert('Temporary Error', 'Please try again in a moment.');
  }
};

export const isRetryableError = (error) => {
  return error instanceof ApiError && error.isRetryable;
};

const ApiServiceDefault = {
  get,
  post,
  put,
  patch,
  delete: del,
  isRetryableError,
  ApiError,
};

// Appointments / Backend
// =====================
// Appointment Service (inlined)
// =====================
// (AppointmentService will be provided by inlined class below)

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  RESCHEDULED: 'rescheduled',
};

export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  EMERGENCY: 'emergency',
  VIDEO_CALL: 'video-call',
  IN_PERSON: 'in-person',
};

const APPOINTMENTS_KEY = '@appointments';
const APPOINTMENT_NOTIFICATIONS_KEY = '@appointment_notifications';

class AppointmentServiceClass {
  constructor() {
    this.listeners = [];
    this.currentUser = null;
    this.currentUserRole = null; // 'patient' or 'doctor'
    this.useBackend = true;
    this.backendAvailable = false;
  }

  async initialize(user, role) {
    this.currentUser = user;
    this.currentUserRole = role;
    try {
      BackendService.setCurrentUser(user);
      this.backendAvailable = await BackendService.testConnection();
    } catch (_) {
      this.backendAvailable = false;
    }
    await this.loadInitialData();
  }

  async loadInitialData() {
    try {
      // Only load data from backend, no demo data initialization
      const existingAppointments = await this.getAllAppointments();
      console.log('🌐 Loaded appointments from backend:', existingAppointments.length);
    } catch (error) {
      console.error('❌ Error loading initial data from backend:', error);
    }
  }

  async initializeDemoData() {
    const today = new Date();
    const todayString = this.getDateString(today);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today); dayAfterTomorrow.setDate(today.getDate() + 2);
    const dayAfterTomorrowString = this.getDateString(dayAfterTomorrow);

    const demoAppointments = [
      { id: 'apt_demo_1', patientId: 'patient_sageikot', patientName: 'Sageikot', patientEmail: 'sageikot@gmail.com', patientPhone: '+234 803 123 4567', doctorId: '1', doctorName: 'Dr. John Smith', doctorEmail: 'ikotnsikak@gmail.com', doctorSpecialty: 'Cardiology', appointmentDate: dayAfterTomorrowString, appointmentTime: '10:00 AM', duration: 30, type: APPOINTMENT_TYPES.CONSULTATION, status: APPOINTMENT_STATUS.PENDING, reason: 'Regular cardiac checkup', notes: 'Patient requesting routine cardiology consultation', bookingDate: todayString, lastModified: todayString, modifiedBy: 'patient_sageikot', notifications: { reminderSent: false, statusChangeSent: false } },
      { id: 'apt_demo_2', patientId: 'patient_judith', patientName: 'Judith Scoft', patientEmail: 'judith.scoft@gmail.com', patientPhone: '+234 803 987 6543', doctorId: '1', doctorName: 'Dr. John Smith', doctorEmail: 'ikotnsikak@gmail.com', doctorSpecialty: 'Cardiology', appointmentDate: todayString, appointmentTime: '09:00 AM', duration: 30, type: APPOINTMENT_TYPES.FOLLOW_UP, status: APPOINTMENT_STATUS.PENDING, reason: 'Follow-up appointment for blood pressure monitoring', notes: 'Patient requesting follow-up consultation for hypertension management', bookingDate: todayString, lastModified: todayString, modifiedBy: 'patient_judith', notifications: { reminderSent: false, statusChangeSent: false } },
      { id: 'apt_demo_3', patientId: 'patient_samuel', patientName: 'Samuel Cole', patientEmail: 'samuel.cole@gmail.com', patientPhone: '+234 803 456 7890', doctorId: '1', doctorName: 'Dr. John Smith', doctorEmail: 'ikotnsikak@gmail.com', doctorSpecialty: 'Cardiology', appointmentDate: this.getDateString(tomorrow), appointmentTime: '02:00 PM', duration: 45, type: APPOINTMENT_TYPES.CONSULTATION, status: APPOINTMENT_STATUS.PENDING, reason: 'New patient consultation', notes: 'New patient with chest pain and shortness of breath', bookingDate: todayString, lastModified: todayString, modifiedBy: 'patient_samuel', notifications: { reminderSent: false, statusChangeSent: false } },
    ];

    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(demoAppointments));
  }

  async createAppointment(appointmentData) {
    const newAppointment = {
      id: `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId: this.currentUser?.id || 'patient_sageikot',
      patientName: this.currentUser?.name || 'Sageikot',
      patientEmail: this.currentUser?.email || 'sageikot@gmail.com',
      patientPhone: this.currentUser?.phone || '+234 803 123 4567',
      ...appointmentData,
      status: APPOINTMENT_STATUS.PENDING,
      bookingDate: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      modifiedBy: this.currentUser?.id || 'patient_sageikot',
      notifications: { reminderSent: false, statusChangeSent: false },
      changeHistory: [{ action: 'created', timestamp: new Date().toISOString(), by: this.currentUser?.id || 'patient_sageikot', role: 'patient' }],
    };

    let createdAppointment;
    if (this.useBackend && this.backendAvailable) {
      createdAppointment = await BackendService.createAppointment(newAppointment);
    } else {
      const appointments = await this.getAllAppointments();
      appointments.push(newAppointment);
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      createdAppointment = newAppointment;
    }
    this.notifyListeners('appointment_created', createdAppointment);
    await this.sendNotificationToDoctor(createdAppointment, 'new_appointment');
    return createdAppointment;
  }

  async updateAppointmentStatus(appointmentId, newStatus, notes = '') {
    const appointments = await this.getAllAppointments();
    const idx = appointments.findIndex(apt => apt.id === appointmentId);
    if (idx === -1) throw new Error('Appointment not found');
    const appointment = appointments[idx];
    const oldStatus = appointment.status;
    appointments[idx] = { ...appointment, status: newStatus, lastModified: new Date().toISOString(), modifiedBy: this.currentUser?.id || appointment.doctorId, doctorNotes: notes, changeHistory: [ ...(appointment.changeHistory || []), { action: `status_changed_${oldStatus}_to_${newStatus}`, timestamp: new Date().toISOString(), by: this.currentUser?.id || appointment.doctorId, role: 'doctor', notes } ] };
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    this.notifyListeners('appointment_updated', appointments[idx]);
    await this.sendNotificationToPatient(appointments[idx], 'status_change', oldStatus);
    return appointments[idx];
  }

  async rescheduleAppointment(appointmentId, newDate, newTime, reason = '') {
    let formattedNewDate = newDate;
    if (newDate.includes('T') || newDate.includes('Z')) {
      const dateObj = new Date(newDate);
      formattedNewDate = this.getDateString(dateObj);
    }
    let updatedAppointment;
    if (this.useBackend && this.backendAvailable) {
      updatedAppointment = await BackendService.rescheduleAppointment(appointmentId, formattedNewDate, newTime, reason);
    } else {
      const appointments = await this.getAllAppointments();
      const idx = appointments.findIndex(apt => apt.id === appointmentId);
      if (idx === -1) throw new Error('Appointment not found');
      const appointment = appointments[idx];
      const oldDate = appointment.appointmentDate; const oldTime = appointment.appointmentTime;
      appointments[idx] = { ...appointment, appointmentDate: formattedNewDate, appointmentTime: newTime, status: APPOINTMENT_STATUS.CONFIRMED, lastModified: new Date().toISOString(), modifiedBy: this.currentUser?.id || appointment.doctorId, rescheduleReason: reason, rescheduleInfo: { rescheduledBy: 'doctor', rescheduledAt: new Date().toISOString(), oldDate, oldTime, newDate: formattedNewDate, newTime, reason, approved: true, approvedAt: new Date().toISOString() }, changeHistory: [ ...(appointment.changeHistory || []), { action: 'rescheduled_by_doctor', timestamp: new Date().toISOString(), by: this.currentUser?.id || appointment.doctorId, role: 'doctor', oldDate, oldTime, newDate: formattedNewDate, newTime, reason, autoApproved: true } ] };
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      updatedAppointment = appointments[idx];
    }
    this.notifyListeners('appointment_rescheduled', updatedAppointment);
    this.notifyListeners('appointment_updated', updatedAppointment);
    await this.sendNotificationToPatient(updatedAppointment, 'reschedule');
    return updatedAppointment;
  }

  async cancelAppointment(appointmentId, reason = '') {
    const appointments = await this.getAllAppointments();
    const idx = appointments.findIndex(apt => apt.id === appointmentId);
    if (idx === -1) throw new Error('Appointment not found');
    const appointment = appointments[idx];
    appointments[idx] = { ...appointment, status: APPOINTMENT_STATUS.CANCELLED, lastModified: new Date().toISOString(), modifiedBy: this.currentUser?.id || (this.currentUserRole === 'doctor' ? appointment.doctorId : appointment.patientId), cancellationReason: reason, changeHistory: [ ...(appointment.changeHistory || []), { action: 'cancelled', timestamp: new Date().toISOString(), by: this.currentUser?.id || (this.currentUserRole === 'doctor' ? appointment.doctorId : appointment.patientId), role: this.currentUserRole, reason } ] };
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    this.notifyListeners('appointment_cancelled', appointments[idx]);
    if (this.currentUserRole === 'doctor') await this.sendNotificationToPatient(appointments[idx], 'cancellation');
    else await this.sendNotificationToDoctor(appointments[idx], 'cancellation');
    return appointments[idx];
  }

  async createRescheduleRequest(appointmentId, newDate, newTime, reason = '') {
    const appointments = await this.getAllAppointments();
    const idx = appointments.findIndex(apt => apt.id === appointmentId);
    if (idx === -1) throw new Error('Appointment not found');
    const appointment = appointments[idx];
    const oldDate = appointment.appointmentDate; const oldTime = appointment.appointmentTime;
    const rescheduleRequest = { requestedDate: newDate, requestedTime: newTime, reason, requestedBy: this.currentUserRole, requestedByUserId: this.currentUser?.id, status: 'pending', requestedAt: new Date().toISOString() };
    appointments[idx] = { ...appointment, status: 'reschedule_requested', rescheduleRequest, lastModified: new Date().toISOString(), modifiedBy: this.currentUser?.id || appointment.patientId, changeHistory: [ ...(appointment.changeHistory || []), { action: 'reschedule_requested', timestamp: new Date().toISOString(), by: this.currentUser?.id || appointment.patientId, role: this.currentUserRole, oldDate, oldTime, newDate, newTime, reason } ] };
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    this.notifyListeners('reschedule_requested', appointments[idx]);
    await this.sendNotificationToDoctor(appointments[idx], 'reschedule_request');
    return appointments[idx];
  }

  async handleRescheduleRequest(appointmentId, approved, doctorNotes = '') {
    const appointments = await this.getAllAppointments();
    const idx = appointments.findIndex(apt => apt.id === appointmentId);
    if (idx === -1) throw new Error('Appointment not found');
    const appointment = appointments[idx];
    if (!appointment.rescheduleRequest) throw new Error('No reschedule request found for this appointment');
    if (approved) {
      appointments[idx] = { ...appointment, appointmentDate: appointment.rescheduleRequest.requestedDate, appointmentTime: appointment.rescheduleRequest.requestedTime, status: 'rescheduled', rescheduleRequest: { ...appointment.rescheduleRequest, status: 'approved', approvedAt: new Date().toISOString(), approvedBy: this.currentUser?.id, doctorNotes }, lastModified: new Date().toISOString(), modifiedBy: this.currentUser?.id, changeHistory: [ ...(appointment.changeHistory || []), { action: 'reschedule_approved', timestamp: new Date().toISOString(), by: this.currentUser?.id, role: 'doctor', newDate: appointment.rescheduleRequest.requestedDate, newTime: appointment.rescheduleRequest.requestedTime, notes: doctorNotes } ] };
    } else {
      appointments[idx] = { ...appointment, status: appointment.rescheduleRequest.oldStatus || 'confirmed', rescheduleRequest: { ...appointment.rescheduleRequest, status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: this.currentUser?.id, doctorNotes }, lastModified: new Date().toISOString(), modifiedBy: this.currentUser?.id, changeHistory: [ ...(appointment.changeHistory || []), { action: 'reschedule_rejected', timestamp: new Date().toISOString(), by: this.currentUser?.id, role: 'doctor', notes: doctorNotes } ] };
    }
    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    this.notifyListeners('reschedule_handled', appointments[idx]);
    await this.sendNotificationToPatient(appointments[idx], 'reschedule_response');
    return appointments[idx];
  }

  async getAllAppointments() {
    try {
      // Force backend usage - no fallback to local storage
      if (this.useBackend && this.backendAvailable) {
        return await BackendService.getAppointments();
      } else {
        // If backend is not available, return empty array instead of demo data
        console.log('🌐 Backend not available, returning empty appointments array');
        return [];
      }
    } catch (error) { 
      console.error('❌ Error fetching appointments from backend:', error);
      return [];
    }
  }

  async getMyAppointments() {
    try {
      const all = await this.getAllAppointments();
      if (this.currentUserRole === 'doctor') {
        return all.filter(apt => apt.doctorId === this.currentUser?.id);
      } else {
        return all.filter(apt => apt.patientId === this.currentUser?.id || apt.patientId === 'patient_sageikot');
      }
    } catch (_) { return [] }
  }

  async refreshData() { try { return await this.getAllAppointments(); } catch (_) { return [] } }

  async getAppointmentsForDate(date) {
    try {
      const appointments = await this.getMyAppointments();
      const targetDate = new Date(date).toISOString().split('T')[0];
      return appointments.filter(apt => new Date(apt.appointmentDate).toISOString().split('T')[0] === targetDate);
    } catch (_) { return [] }
  }

  async getAppointmentById(appointmentId) { try { const appts = await this.getAllAppointments(); return appts.find(apt => apt.id === appointmentId) } catch (_) { return null } }

  async sendNotificationToDoctor(appointment, type) {
    try {
      const notifications = await this.getStoredNotifications();
      let title = '', body = '';
      if (type === 'new_appointment') {
        title = 'New Appointment Request';
        body = `${appointment.patientName} has requested an appointment for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}`;
      } else if (type === 'cancellation') {
        title = 'Appointment Cancelled';
        body = `${appointment.patientName} has cancelled their appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()}`;
      }
      const notif = { id: `notif_${Date.now()}`, appointmentId: appointment.id, recipientRole: 'doctor', recipientId: appointment.doctorId, type, title, body, read: false, timestamp: new Date().toISOString() };
      notifications.push(notif);
      await AsyncStorage.setItem(APPOINTMENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (_) {}
  }

  async sendNotificationToPatient(appointment, type) {
    try {
      const notifications = await this.getStoredNotifications();
      let title = '', body = '';
      if (type === 'status_change') {
        const statusMessages = { [APPOINTMENT_STATUS.CONFIRMED]: 'confirmed', [APPOINTMENT_STATUS.CANCELLED]: 'cancelled', [APPOINTMENT_STATUS.COMPLETED]: 'marked as completed' };
        title = 'Appointment Status Update';
        body = `Your appointment with ${appointment.doctorName} has been ${statusMessages[appointment.status] || appointment.status}`;
      } else if (type === 'reschedule') {
        title = 'Appointment Rescheduled';
        body = `Your appointment with ${appointment.doctorName} has been rescheduled to ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}`;
      } else if (type === 'cancellation') {
        title = 'Appointment Cancelled';
        body = `Your appointment with ${appointment.doctorName} scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled`;
      }
      const notif = { id: `notif_${Date.now()}`, appointmentId: appointment.id, recipientRole: 'patient', recipientId: appointment.patientId, type, title, body, read: false, timestamp: new Date().toISOString() };
      notifications.push(notif);
      await AsyncStorage.setItem(APPOINTMENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (_) {}
  }

  async getStoredNotifications() { try { const stored = await AsyncStorage.getItem(APPOINTMENT_NOTIFICATIONS_KEY); return stored ? JSON.parse(stored) : [] } catch (_) { return [] } }

  async getMyNotifications() {
    try {
      const all = await this.getStoredNotifications();
      if (this.currentUserRole === 'doctor') {
        return all.filter(n => n.recipientRole === 'doctor' && n.recipientId === this.currentUser?.id);
      } else {
        return all.filter(n => n.recipientRole === 'patient' && (n.recipientId === this.currentUser?.id || n.recipientId === 'patient_sageikot'));
      }
    } catch (_) { return [] }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getStoredNotifications();
      const idx = notifications.findIndex(n => n.id === notificationId);
      if (idx !== -1) {
        notifications[idx].read = true;
        await AsyncStorage.setItem(APPOINTMENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (_) {}
  }

  addListener(callback) { this.listeners.push(callback); }
  removeListener(callback) { this.listeners = this.listeners.filter(listener => listener !== callback); }
  notifyListeners(event, data) { this.listeners.forEach(cb => { try { cb(event, data); } catch (_) {} }); }

  async debugStorage() { try { const all = await this.getAllAppointments(); return all } catch (_) { return [] } }

  debugDateParsing(dateString, timeString) {
    try { const [y, m, d] = dateString.split('-').map(n => parseInt(n, 10)); const [h, mm] = timeString.split(':').map(n => parseInt(n, 10)); return new Date(y, m - 1, d, h, mm, 0, 0) } catch (_) { return null }
  }

  async clearAllData() { try { await AsyncStorage.removeItem(APPOINTMENTS_KEY); await AsyncStorage.removeItem(APPOINTMENT_NOTIFICATIONS_KEY); return true } catch (_) { return false } }

  async clearAndReinitialize() { try { await AsyncStorage.removeItem(APPOINTMENTS_KEY); await AsyncStorage.removeItem(APPOINTMENT_NOTIFICATIONS_KEY); this.listeners = []; await this.initializeDemoData(); return true } catch (_) { return false } }

  formatDateForDisplay(dateString) { try { const d = new Date(dateString); if (isNaN(d.getTime())) return 'Invalid Date'; return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) } catch (_) { return 'Invalid Date' } }

  getDateString(date) { try { const d = new Date(date); if (isNaN(d.getTime())) return null; const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const dd = String(d.getDate()).padStart(2, '0'); return `${y}-${m}-${dd}` } catch (_) { return null } }

  isSameDay(date1, date2) { try { const d1 = new Date(date1), d2 = new Date(date2); if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false; return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate() } catch (_) { return false } }

  createDateTimeFromStrings(dateString, timeString) {
    try {
      const [y, m, d] = dateString.split('-').map(n => parseInt(n, 10));
      let h, mm, period;
      if (timeString.includes('AM') || timeString.includes('PM')) {
        const t = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!t) throw new Error('Invalid time format');
        [, h, mm, period] = t; h = parseInt(h); mm = parseInt(mm);
        if (period.toUpperCase() === 'PM' && h !== 12) h += 12; else if (period.toUpperCase() === 'AM' && h === 12) h = 0;
      } else { [h, mm] = timeString.split(':').map(n => parseInt(n, 10)); }
      const dt = new Date(y, m - 1, d, h, mm, 0, 0);
      if (isNaN(dt.getTime())) throw new Error('Invalid date created');
      return dt;
    } catch (_) { return null }
  }
}

export const AppointmentService = new AppointmentServiceClass();
export const appointments = AppointmentService;

// Health data & activity
// Inline minimal health services
export const HEALTH_METRIC_TYPES = { WEIGHT: 'weight', HEIGHT: 'height', BLOOD_PRESSURE: 'bp', BMI: 'bodymass' };
export const WELLNESS_CALCULATION_TYPES = { BMI: 'bmi', CALORIE: 'calorie', OVULATION: 'ovulation' };
export const MEDICATION_STATUS = { ACTIVE: 'active', COMPLETED: 'completed', PAUSED: 'paused', DISCONTINUED: 'discontinued' };
export const CONDITION_STATUS = { ACTIVE: 'active', RESOLVED: 'resolved', MANAGED: 'managed' };
const HEALTH_METRICS_KEY = '@health_metrics';
const MEDICATIONS_KEY = '@medications';
const CONDITIONS_KEY = '@conditions';
const WELLNESS_CALCULATIONS_KEY = '@wellness_calculations';
const HEALTH_HISTORY_KEY = '@health_history';

const HealthDataServiceDefault = {
  getDefaultMetrics: () => {
    const defaultStructure = {};
    Object.values(HEALTH_METRIC_TYPES).forEach(type => { defaultStructure[type] = { current: null, history: [], lastUpdated: null }; });
    return defaultStructure;
  },
  getHealthMetrics: async () => { const stored = await AsyncStorage.getItem(HEALTH_METRICS_KEY); return stored ? JSON.parse(stored) : HealthDataServiceDefault.getDefaultMetrics(); },
  addHealthMetric: async (metricType, metricData) => {
    const current = await HealthDataServiceDefault.getHealthMetrics();
    if (!current[metricType]) current[metricType] = { current: null, history: [], lastUpdated: null };
    const entry = { id:`${metricType}_${Date.now()}`, type:metricType, value:metricData.value, unit:metricData.unit, date: metricData.date || new Date().toISOString(), notes: metricData.notes||'', source: metricData.source||'manual' };
    current[metricType].history.unshift(entry); current[metricType].current = entry; current[metricType].lastUpdated = entry.date;
    await AsyncStorage.setItem(HEALTH_METRICS_KEY, JSON.stringify(current));
    return entry;
  },
  getMetricHistory: async (metricType, limit=50) => { const m=await HealthDataServiceDefault.getHealthMetrics(); const d=m[metricType]; if(!d||!d.history) return []; return d.history.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,limit); },
  addMedication: async (med) => { const stored=await AsyncStorage.getItem(MEDICATIONS_KEY); const list=stored?JSON.parse(stored):[]; const item={ id:`med_${Date.now()}`, status: MEDICATION_STATUS.ACTIVE, ...med }; list.push(item); await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(list)); return item; },
  getMedications: async () => { const stored=await AsyncStorage.getItem(MEDICATIONS_KEY); return stored?JSON.parse(stored):[] },
  updateMedicationStatus: async (id,status) => { const list=await HealthDataServiceDefault.getMedications(); const i=list.findIndex(m=>m.id===id); if(i>-1){ list[i].status=status; await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(list)); return list[i]; } throw new Error('Medication not found'); },
  addCondition: async (cond) => { const stored=await AsyncStorage.getItem(CONDITIONS_KEY); const list=stored?JSON.parse(stored):[]; const item={ id:`cond_${Date.now()}`, status: CONDITION_STATUS.ACTIVE, ...cond }; list.push(item); await AsyncStorage.setItem(CONDITIONS_KEY, JSON.stringify(list)); return item; },
  getConditions: async () => { const stored=await AsyncStorage.getItem(CONDITIONS_KEY); return stored?JSON.parse(stored):[] },
  saveWellnessCalculation: async (type,data) => { const stored=await AsyncStorage.getItem(WELLNESS_CALCULATIONS_KEY); const list=stored?JSON.parse(stored):[]; const item={ id:`calc_${type}_${Date.now()}`, type, inputData:data.input, results:data.results, date:new Date().toISOString() }; list.unshift(item); if(list.length>100) list.splice(100); await AsyncStorage.setItem(WELLNESS_CALCULATIONS_KEY, JSON.stringify(list)); return item; },
  getWellnessCalculationHistory: async (type=null,limit=20) => { const stored=await AsyncStorage.getItem(WELLNESS_CALCULATIONS_KEY); let list=stored?JSON.parse(stored):[]; if(type) list=list.filter(c=>c.type===type); return list.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,limit); },
  getHealthAnalytics: async () => { const [metrics,meds,conds,calcs]=await Promise.all([HealthDataServiceDefault.getHealthMetrics(), HealthDataServiceDefault.getMedications(), HealthDataServiceDefault.getConditions(), HealthDataServiceDefault.getWellnessCalculationHistory()]); return { summary:{ totalMetrics:Object.keys(metrics).length, activeMedications: meds.filter(m=>m.status===MEDICATION_STATUS.ACTIVE).length, activeConditions: conds.filter(c=>c.status===CONDITION_STATUS.ACTIVE).length, recentCalculations: calcs.length }, recentActivity:[], trends:{}, lastUpdated:new Date().toISOString() } },
};
const ACTIVITY_TYPES = { WALKING:'walking', RUNNING:'running' };
const HealthActivityServiceDefault = { logActivity: async (activity)=>({ ...activity, id:`act_${Date.now()}` }) };

// Notifications
// (notification services are inlined below)

// Communications - ChatService is inlined below
// Inline lightweight Telnyx and Google Meet facades (simulated for dev)
const telnyxService = {
  initialize: async () => true,
  connect: async () => true,
  disconnect: () => {},
  makeCall: async () => ({ callId: `call_${Date.now()}` }),
  makeVideoCall: async () => ({ callId: `call_${Date.now()}` }),
  answerCall: () => true,
  rejectCall: () => true,
  endCall: () => true,
  toggleMute: () => true,
  toggleVideo: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
  getCurrentCallState: () => ({ isConnected: true })
};
const googleMeetService = {
  initialize: () => {},
  createMeeting: async (appointmentDetails, doctorInfo, patientInfo) => ({ id: `pms-${appointmentDetails.id}-${Date.now()}`, url: 'https://meet.google.com/new', appointmentId: appointmentDetails.id, doctor: doctorInfo, patient: patientInfo, appointmentDetails, createdAt: new Date().toISOString(), status: 'active' }),
  generateMeetingCode: () => 'abc-defg-hij',
  getMeeting: () => null,
  getMeetingByAppointment: () => null,
  joinMeeting: async (url) => true,
  endMeeting: () => true,
  getActiveMeetings: () => []
};

// Payments
import { paystackPublicKey } from '../config/env';
import { Linking } from 'react-native';
import { openComposer } from 'react-native-email-link';

// User Management
// Inline UserManagement service
export const USER_TYPES = { PATIENT:'patient', DOCTOR:'doctor', INSTITUTION:'institution', ADMIN:'admin' };
export const USER_STATUS = { ACTIVE:'active', INACTIVE:'inactive', PENDING:'pending', SUSPENDED:'suspended', VERIFIED:'verified' };
const transformUserDataForProfile = (userData) => {
  const t={ ...userData };
  if (userData.firstName && userData.lastName) t.name = `${userData.firstName} ${userData.lastName}`; else if (userData.firstName) t.name = userData.firstName; else if (userData.lastName) t.name = userData.lastName;
  if (userData.phoneNumber) t.phone = userData.phoneNumber;
  t.firstName=userData.firstName; t.lastName=userData.lastName; t.phoneNumber=userData.phoneNumber;
  return t;
};
class UserManagementServiceClass {
  async createUser(userData,userType){ const endpoint=this.getRegistrationEndpoint(userType); const transformed=transformUserDataForProfile(userData); const body={ ...transformed, userType, status:USER_STATUS.PENDING }; if(isDevelopment()) await createUserForDevelopment(body); const response = await post(endpoint, body); const data = response.data ? transformUserDataForProfile(response.data) : null; return { success:true, data, message: response.message || 'User created successfully' } }
  async getUserProfile(userId){ const response=await get(`${ENDPOINTS.PROFILE.GET}/${userId}`); return transformUserDataForProfile(response.data) }
  async updateUserProfile(userId,update){ let d={ ...update }; if (update.name && !update.firstName && !update.lastName){ const p=update.name.split(' '); d.firstName=p[0]||''; d.lastName=p.slice(1).join(' ')||''; } if (update.phone) d.phoneNumber=update.phone; const response=await put(`${ENDPOINTS.PROFILE.UPDATE}/${userId}`, d); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Profile updated successfully' } }
  async getUsersByType(userType,page=1,limit=20,filters={}){ const response=await get('/users',{ userType,page,limit,...filters }); const transformed=(response.data||[]).map(transformUserDataForProfile); return { data: transformed, pagination: response.pagination||{}, hasMore: response.pagination?.hasNextPage||false } }
  async searchUsers(q,userType=null,page=1,limit=20){ const response=await get('/users/search',{ q,userType,page,limit }); const transformed=(response.data||[]).map(transformUserDataForProfile); return { data: transformed, pagination: response.pagination||{}, hasMore: response.pagination?.hasNextPage||false } }
  async updateUserStatus(userId,status){ const response=await patch(`/users/${userId}/status`,{ status }); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Status updated successfully' } }
  async uploadProfilePhoto(userId,image){ const formData=new FormData(); formData.append('photo',{ uri:image.uri, type:image.type, name:image.fileName||'profile.jpg' }); const response=await post(`${ENDPOINTS.PROFILE.UPLOAD_PHOTO}/${userId}`, formData, { headers:{ 'Content-Type':'multipart/form-data' } }); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Photo uploaded successfully' } }
  async verifyUser(userId,verification){ const response=await post(`/users/${userId}/verify`, verification); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'User verified successfully' } }
  async getUserStats(userType=null){ const response=await get('/users/stats',{ userType }); return response.data }
  async createPatientProfile(data){ const transformed=transformUserDataForProfile(data); const body={ ...transformed, userType:USER_TYPES.PATIENT }; if(isDevelopment()) await createUserForDevelopment(body); const response=await post('/patients', body); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Patient profile created successfully' } }
  async updatePatientMedicalHistory(patientId,medicalHistory){ const response=await put(`/patients/${patientId}/medical-history`,{ medicalHistory }); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Medical history updated successfully' } }
  async createDoctorProfile(data){ const transformed=transformUserDataForProfile(data); const body={ ...transformed, userType:USER_TYPES.DOCTOR }; if(isDevelopment()) await createUserForDevelopment(body); const response=await post('/doctors', body); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Doctor profile created successfully' } }
  async updateDoctorSpecialization(doctorId,specializations){ const response=await put(`/doctors/${doctorId}/specializations`,{ specializations }); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Specializations updated successfully' } }
  async getDoctorSchedule(doctorId){ const response=await get(`/doctors/${doctorId}/schedule`); return response.data }
  async createInstitutionProfile(data){ const transformed=transformUserDataForProfile(data); const body={ ...transformed, userType:USER_TYPES.INSTITUTION }; if(isDevelopment()) await createUserForDevelopment(body); const response=await post('/institutions', body); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Institution profile created successfully' } }
  async updateInstitutionServices(institutionId,services){ const response=await put(`/institutions/${institutionId}/services`,{ services }); return { success:true, data: transformUserDataForProfile(response.data), message: response.message || 'Services updated successfully' } }
  async getInstitutionDoctors(institutionId,page=1,limit=20){ const response=await get(`/institutions/${institutionId}/doctors`,{ page,limit }); const transformed=(response.data||[]).map(transformUserDataForProfile); return { data:transformed, pagination:response.pagination||{}, hasMore: response.pagination?.hasNextPage||false } }
  getRegistrationEndpoint(userType){ switch(userType){ case USER_TYPES.PATIENT:return '/patients/register'; case USER_TYPES.DOCTOR:return '/doctors/register'; case USER_TYPES.INSTITUTION:return '/institutions/register'; default:return ENDPOINTS.AUTH.REGISTER; } }
  validateUserData(userData,userType){ const common=['email','password','firstName','lastName']; const specific={ [USER_TYPES.PATIENT]:['dateOfBirth','gender'], [USER_TYPES.DOCTOR]:['medicalLicense','specializations'], [USER_TYPES.INSTITUTION]:['institutionName','address','phoneNumber'] }; const required=[...common, ...(specific[userType]||[])]; const missing=required.filter(f=>!userData[f]); if(missing.length) throw new Error(`Missing required fields: ${missing.join(', ')}`); return true }
  formatUserData(userData,userType){ const t=transformUserDataForProfile(userData); const formatted={ ...t, userType, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString() }; if(userType===USER_TYPES.PATIENT) formatted.patientId=`PAT_${Date.now()}`; if(userType===USER_TYPES.DOCTOR) formatted.doctorId=`DOC_${Date.now()}`; if(userType===USER_TYPES.INSTITUTION) formatted.institutionId=`INST_${Date.now()}`; return formatted }
}
export const UserManagementService = new UserManagementServiceClass();
export const userManagement = UserManagementService;

// Doctor/Email services (if used elsewhere)
// (doctor and email services are inlined below)

// =====================
// Auth/Profile (inlined)
// =====================

// Using TOKEN_KEY and REFRESH_TOKEN_KEY from top of file
const USER_KEY = '@user_data';
const CREATED_USERS_KEY = '@created_users';

const transformUserData = (userData) => {
  const transformed = { ...userData };
  if (userData.firstName && userData.lastName) {
    transformed.name = `${userData.firstName} ${userData.lastName}`;
  } else if (userData.firstName) {
    transformed.name = userData.firstName;
  } else if (userData.lastName) {
    transformed.name = userData.lastName;
  }
  if (userData.phoneNumber) {
    transformed.phone = userData.phoneNumber;
  }
  transformed.firstName = userData.firstName;
  transformed.lastName = userData.lastName;
  transformed.phoneNumber = userData.phoneNumber;
  return transformed;
};

const storeCreatedUser = async (userData) => {
  if (!isDevelopment()) return;
  try {
    const existingUsersJson = await AsyncStorage.getItem(CREATED_USERS_KEY);
    const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];
    const userExists = existingUsers.find(user => user.email === userData.email);
    if (!userExists) {
      const transformedData = transformUserData(userData);
      existingUsers.push({
        ...transformedData,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(CREATED_USERS_KEY, JSON.stringify(existingUsers));
    }
  } catch (_) {}
};

export const login = async (email, password) => {
  try {
    if (isDevelopment()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existingUsersJson = await AsyncStorage.getItem(CREATED_USERS_KEY);
      const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];
      const createdUser = existingUsers.find(u => u.email === email && u.password === password);
      if (createdUser) {
        const user = {
          _id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          phone: createdUser.phone,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          phoneNumber: createdUser.phoneNumber,
          userType: createdUser.userType || 'patient',
          status: 'active',
          createdAt: createdUser.createdAt,
          updatedAt: new Date().toISOString(),
        };
        const tokens = {
          accessToken: `dev_token_${Date.now()}`,
          refreshToken: `dev_refresh_${Date.now()}`,
        };
        await AsyncStorage.setItem(TOKEN_KEY, tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
        return { user, success: true };
      }
      if (email === 'test@example.com' && password === 'password') {
        const { data } = dummyAuthResponse;
        const transformedUser = transformUserData(data.user);
        const finalUser = { ...data.user, ...transformedUser };
        await AsyncStorage.setItem(TOKEN_KEY, data.tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUser));
        return { user: finalUser, success: true };
      }
      const userEmails = existingUsers?.map(u => u.email).join(', ');
      throw new Error(
        existingUsers?.length
          ? `Invalid credentials. Available test accounts: test@example.com, ${userEmails}`
          : 'Invalid credentials. Try creating an account first or use test@example.com with password "password"'
      );
    }

    const response = await post(ENDPOINTS.AUTH.LOGIN, { email, password });
    const { user, tokens } = response.data;
    const finalUser = { ...user, ...transformUserData(user) };
    await AsyncStorage.setItem(TOKEN_KEY, tokens.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUser));
    return { user: finalUser, success: true };
  } catch (error) {
    throw new Error(error?.message || 'Login failed. Please try again.');
  }
};

export const register = async (userData) => {
  try {
    if (isDevelopment()) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const transformedData = transformUserData(userData);
      await storeCreatedUser(transformedData);
      return {
        success: true,
        message: 'Registration successful',
        data: {
          ...dummyAuthResponse.data.user,
          ...transformedData,
          _id: 'dummy_id_' + Date.now(),
        }
      };
    }
    const response = await post(ENDPOINTS.AUTH.REGISTER, userData);
    if (response.data) {
      const transformedUser = transformUserData(response.data);
      response.data = { ...response.data, ...transformedUser };
    }
    return response;
  } catch (error) {
    throw new Error(error?.message || 'Registration failed. Please try again.');
  }
};

export const createUserForDevelopment = async (userData) => {
  if (!isDevelopment()) return;
  try {
    const transformedData = transformUserData(userData);
    await storeCreatedUser(transformedData);
  } catch (_) {}
};

export const getCreatedUsers = async () => {
  if (!isDevelopment()) return [];
  try {
    const existingUsersJson = await AsyncStorage.getItem(CREATED_USERS_KEY);
    return existingUsersJson ? JSON.parse(existingUsersJson) : [];
  } catch (_) {
    return [];
  }
};

export const clearCreatedUsers = async () => {
  if (!isDevelopment()) return;
  try {
    await AsyncStorage.removeItem(CREATED_USERS_KEY);
  } catch (_) {}
};

export const logout = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && !isDevelopment()) {
      await del(ENDPOINTS.AUTH.LOGOUT);
    }
  } catch (_) {
  } finally {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }
};

export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !!token;
};

export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (_) {
    return null;
  }
};

export const getUserProfile = async () => {
  try {
    if (isDevelopment()) {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    }
    const response = await get(ENDPOINTS.PROFILE.GET);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserProfile = async (profileData) => {
  try {
    if (isDevelopment()) {
      await new Promise(resolve => setTimeout(resolve, 800));
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (!userData) throw new Error('User not found');
      const user = JSON.parse(userData);
      let updatedData = { ...profileData };
      if (profileData.name && !profileData.firstName && !profileData.lastName) {
        const nameParts = profileData.name.split(' ');
        updatedData.firstName = nameParts[0] || '';
        updatedData.lastName = nameParts.slice(1).join(' ') || '';
      }
      if (profileData.phone) {
        updatedData.phoneNumber = profileData.phone;
      }
      const updatedUser = { ...user, ...updatedData, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }

    const response = await put(ENDPOINTS.PROFILE.UPDATE, profileData);
    const updatedUser = transformUserData(response.data);
    const finalUser = { ...response.data, ...updatedUser };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUser));
    return finalUser;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async () => {
  if (isDevelopment()) {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) return null;
    return transformUserData(JSON.parse(userData));
  }
  const response = await get(ENDPOINTS.PROFILE.GET);
  return transformUserData(response.data);
};

export const updateProfile = async (profileData) => {
  if (isDevelopment()) {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) throw new Error('User not found');
    const user = JSON.parse(userData);
    let transformedProfileData = { ...profileData };
    if (profileData.name && !profileData.firstName && !profileData.lastName) {
      const nameParts = profileData.name.split(' ');
      transformedProfileData.firstName = nameParts[0] || '';
      transformedProfileData.lastName = nameParts.slice(1).join(' ') || '';
    }
    if (profileData.phone) {
      transformedProfileData.phoneNumber = profileData.phone;
    }
    const updatedUser = { ...user, ...transformedProfileData, updatedAt: new Date().toISOString() };
    const transformedUser = transformUserData(updatedUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedUser));
    return transformedUser;
  }
  let backendProfileData = { ...profileData };
  if (profileData.name && !profileData.firstName && !profileData.lastName) {
    const nameParts = profileData.name.split(' ');
    backendProfileData.firstName = nameParts[0] || '';
    backendProfileData.lastName = nameParts.slice(1).join(' ') || '';
  }
  if (profileData.phone) {
    backendProfileData.phoneNumber = profileData.phone;
  }
  const response = await put(ENDPOINTS.PROFILE.UPDATE, backendProfileData);
  const transformedData = transformUserData(response.data);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedData));
  return transformedData;
};

export const uploadProfilePhoto = async (photo) => {
  if (isDevelopment()) {
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) throw new Error('User not found');
    const user = JSON.parse(userData);
    const updatedUser = { ...user, profilePicture: photo.uri, updatedAt: new Date().toISOString() };
    const transformedUser = transformUserData(updatedUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedUser));
    return transformedUser;
  }
  const formData = new FormData();
  formData.append('photo', {
    uri: photo.uri,
    type: photo.type || 'image/jpeg',
    name: photo.fileName || 'profile.jpg',
  });
  const response = await post(ENDPOINTS.PROFILE.UPLOAD_PHOTO, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const transformedData = transformUserData(response.data);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedData));
  return transformedData;
};

export const changePassword = async (currentPassword, newPassword) => {
  if (isDevelopment()) {
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Password changed successfully' };
  }
  const response = await put(ENDPOINTS.PROFILE.CHANGE_PASSWORD, { currentPassword, newPassword });
  return response.data;
};

// Base API client (single point of truth)
export const ApiService = ApiServiceDefault;
// ApiError and isRetryableError are already exported above

// Also provide direct HTTP helpers (optional)
export const http = {
  get,
  post,
  put,
  patch,
  delete: del,
};

// Namespaced API groups (preserve existing identifiers where possible)
export const AuthService = {
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  createUserForDevelopment,
  getCreatedUsers,
  clearCreatedUsers,
};

export const ProfileService = { getProfile, updateProfile, uploadProfilePhoto, changePassword };
export const profile = { getProfile, updateProfile, uploadPhoto: uploadProfilePhoto, changePassword };

// AppointmentService will be provided via api.appointments once inlined or by external module if not yet inlined

// Inline BackendService
// Use computer's local IP for physical devices, 10.0.2.2 for Android emulator
const API_BASE_URL = __DEV__ ? 'http://192.168.1.100:3000/api/v1' : 'http://10.0.2.2:3000/api/v1';
const API_ENDPOINTS = {
  APPOINTMENTS: '/appointments',
  USERS: '/users',
  NOTIFICATIONS: '/notifications',
  AUTH: '/auth',
  HEALTH: '/health',
};

class BackendServiceClass {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.authToken = null;
    this.currentUser = null;
  }
  setAuthToken(token) { this.authToken = token; }
  setCurrentUser(user) { this.currentUser = user; }
  getHeaders() {
    const headers = { 
      'Content-Type': 'application/json',
      'x-api-key': ENV.X_API_KEY
    };
    if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
    return headers;
  }
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = { headers: this.getHeaders(), timeout: 10000, ...options };
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);
    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  }
  async getAppointments() { return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENTS}/`); }
  async getAppointmentById(appointmentId) { return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`); }
  async createAppointment(appointmentData) { return await this.makeRequest(API_ENDPOINTS.APPOINTMENTS, { method: 'POST', body: JSON.stringify(appointmentData) }); }
  async updateAppointmentStatus(appointmentId, status, notes = '') { return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }); }
  async rescheduleAppointment(appointmentId, newDate, newTime, reason = '') { return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/reschedule`, { method: 'PATCH', body: JSON.stringify({ newDate, newTime, reason }) }); }
  async cancelAppointment(appointmentId, reason = '') { return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason }) }); }
  async createRescheduleRequest(appointmentId, newDate, newTime, reason = '') { return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/reschedule-request`, { method: 'POST', body: JSON.stringify({ newDate, newTime, reason }) }); }
  async handleRescheduleRequest(appointmentId, approved, notes = '') { return await this.makeRequest(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}/reschedule-request`, { method: 'PATCH', body: JSON.stringify({ approved, notes }) }); }
  async getNotifications() { return await this.makeRequest(`${API_ENDPOINTS.NOTIFICATIONS}/`); }
  async markNotificationAsRead(notificationId) { return await this.makeRequest(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`, { method: 'PATCH' }); }
  async getUserProfile() { return await this.makeRequest(`${API_ENDPOINTS.USERS}/profile`); }
  async updateUserProfile(profileData) { return await this.makeRequest(`${API_ENDPOINTS.USERS}/profile`, { method: 'PATCH', body: JSON.stringify(profileData) }); }
  async login(credentials) { const res = await this.makeRequest(`${API_ENDPOINTS.AUTH}/login`, { method: 'POST', body: JSON.stringify(credentials) }); if (res.token) this.setAuthToken(res.token); return res; }
  async register(userData) { const res = await this.makeRequest(`${API_ENDPOINTS.AUTH}/register`, { method: 'POST', body: JSON.stringify(userData) }); if (res.token) this.setAuthToken(res.token); return res; }
  async logout() { try { await this.makeRequest(`${API_ENDPOINTS.AUTH}/logout`, { method: 'POST' }); } catch (_) {} finally { this.authToken = null; this.currentUser = null; } }
  async testConnection() {
    try {
      // Test with a simple GET request to the base URL to check if server is responding
      const response = await fetch(`${this.baseURL}`, {
        method: 'GET',
        headers: { 'x-api-key': ENV.X_API_KEY },
        timeout: 5000
      });
      
      // If we get any response (even 401), the server is running
      if (response.status === 401) {
        // 401 means server is running but requires authentication - this is GOOD!
        return true;
      }
      
      // Any other status means server is responding
      return response.status >= 200 && response.status < 600;
    } catch (error) {
      console.log('🔍 Backend connection test failed:', error.message);
      return false;
    }
  }
  async syncData() {
    const isConnected = await this.testConnection();
    if (!isConnected) throw new Error('Backend not available');
    const appointments = await this.getAppointments();
    const notifications = await this.getNotifications();
    return { appointments, notifications };
  }
  getServiceStatus() { return { connected: !!this.authToken, baseURL: this.baseURL, currentUser: this.currentUser ? this.currentUser.id : null, hasToken: !!this.authToken }; }
}

export const BackendService = new BackendServiceClass();
export const backendService = BackendService;

export const HealthDataService = HealthDataServiceDefault;
export const healthData = HealthDataServiceDefault;

export const HealthActivityService = HealthActivityServiceDefault;
export const healthActivity = HealthActivityServiceDefault;

// Inline Notification services
class NotificationServiceClass {
  constructor(){ this.scheduledNotifications=new Map(); this.sentNotifications=new Set(); this.notificationQueue=[]; this.isServiceRunning=false; }
  async initialize(){ try{ const saved=await AsyncStorage.getItem('scheduledNotifications'); if(saved){ this.scheduledNotifications=new Map(JSON.parse(saved)); } const sent=await AsyncStorage.getItem('sentNotifications'); if(sent){ this.sentNotifications=new Set(JSON.parse(sent)); } this.isServiceRunning=true; this.startNotificationChecker(); } catch(_){} }
  parseAppointmentDateTime(dateStr,timeStr){ try{ let parsedDateStr=dateStr; if(dateStr.includes('T')||dateStr.includes('Z')){ const iso=new Date(dateStr); const y=iso.getFullYear(); const m=String(iso.getMonth()+1).padStart(2,'0'); const d=String(iso.getDate()).padStart(2,'0'); parsedDateStr=`${y}-${m}-${d}`; } const [y,m,d]=parsedDateStr.split('-').map(Number); let h,mm,period; if(timeStr.includes('AM')||timeStr.includes('PM')){ const t=timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); [,h,mm,period]=t; h=parseInt(h); mm=parseInt(mm); if(period.toUpperCase()==='PM'&&h!==12) h+=12; else if(period.toUpperCase()==='AM'&&h===12) h=0; } else { [h,mm]=timeStr.match(/^(\d{1,2}):(\d{2})$/).slice(1).map(Number); } return new Date(y,m-1,d,h,mm,0,0) } catch(e){ return null } }
  scheduleAppointmentReminder(appointment,reminderMinutes=30){ try{ if(!appointment||!appointment.date||!appointment.appointmentTime||!appointment.id||!appointment.patientName) return null; const apptTime=this.parseAppointmentDateTime(appointment.date,appointment.appointmentTime); if(!apptTime) return null; const reminderTime=new Date(apptTime.getTime()-reminderMinutes*60*1000); if(reminderTime<=new Date()) return null; const id=`appointment_${appointment.id}_${reminderMinutes}min`; if(this.sentNotifications.has(id)) return null; const notif={ id, appointmentId:appointment.id, type:'appointment_reminder', title:`Appointment in ${reminderMinutes} minutes`, message:`You have an appointment with ${appointment.patientName} in ${reminderMinutes} minutes`, scheduledTime:reminderTime.toISOString(), appointmentData:appointment, reminderMinutes }; this.scheduledNotifications.set(id,notif); this.saveNotifications(); return id } catch(_){ return null } }
  scheduleAppointmentReminders(appointments,mins=[30,15,5]){ const ids=[]; appointments.forEach(a=>mins.forEach(m=>{ const id=this.scheduleAppointmentReminder(a,m); if(id) ids.push(id); })); return ids }
  startNotificationChecker(){ if(!this.isServiceRunning) return; this.checkInterval=setInterval(()=>this.checkForDueNotifications(),60000); }
  checkForDueNotifications(){ const now=new Date(); const due=[]; this.scheduledNotifications.forEach((n,k)=>{ const t=new Date(n.scheduledTime); const diff=now.getTime()-t.getTime(); if(diff>=0&&diff<=60000&&!this.sentNotifications.has(n.id)) due.push({k,n}); }); due.forEach(({k,n})=>{ this.triggerNotification(n); this.sentNotifications.add(n.id); this.scheduledNotifications.delete(k); }); if(due.length){ this.saveNotifications(); this.saveSentNotifications(); } }
  triggerNotification(n){ Alert.alert(n.title,n.message,[{text:'OK',onPress:()=>{}}]); this.addToNotificationHistory({ id:n.id, type:n.type, title:n.title, message:n.message, timestamp:new Date().toISOString() }); }
  async addToNotificationHistory(notification){ try{ const key='notificationHistory'; const existing=await AsyncStorage.getItem(key); const history=existing?JSON.parse(existing):[]; history.unshift(notification); if(history.length>50) history.splice(50); await AsyncStorage.setItem(key,JSON.stringify(history)); } catch(_){} }
  async getNotificationHistory(){ try{ const history=await AsyncStorage.getItem('notificationHistory'); return history?JSON.parse(history):[] } catch(_){ return [] } }
  
  // Add missing method that HomeScreen expects
  async getScheduledNotifications() {
    try {
      const scheduled = await AsyncStorage.getItem('scheduledNotifications');
      return scheduled ? JSON.parse(scheduled) : [];
    } catch (_) {
      return [];
    }
  }
  async saveNotifications(){ try{ const arr=Array.from(this.scheduledNotifications.entries()); await AsyncStorage.setItem('scheduledNotifications',JSON.stringify(arr)); } catch(_){} }
  async saveSentNotifications(){ try{ const arr=Array.from(this.sentNotifications); await AsyncStorage.setItem('sentNotifications',JSON.stringify(arr)); } catch(_){} }
  stop(){ this.isServiceRunning=false; if(this.checkInterval) clearInterval(this.checkInterval); }
  createNotification(type,title,message,data={}){ return { id:Date.now().toString()+Math.random().toString(36).substr(2,9), type,title,message,timestamp:new Date().toISOString(), ...data } }
  
  // Add missing method that HomeScreen expects
  testAppointmentDataStructure(appointment) {
    if (!appointment) return false;
    const requiredFields = ['id', 'patientName', 'appointmentDate', 'appointmentTime'];
    return requiredFields.every(field => appointment[field] !== undefined && appointment[field] !== null);
  }
  
  // Add missing method that HomeScreen expects
  scheduleAllTodaysReminders(appointments) {
    if (!Array.isArray(appointments)) return [];
    return this.scheduleAppointmentReminders(appointments, [30, 15, 5]);
  }
  
  // Add missing method that HomeScreen expects
  cleanupExpiredNotifications() {
    const now = new Date();
    const expired = [];
    
    this.scheduledNotifications.forEach((notification, id) => {
      const scheduledTime = new Date(notification.scheduledTime);
      if (scheduledTime < now) {
        expired.push(id);
      }
    });
    
    expired.forEach(id => {
      this.scheduledNotifications.delete(id);
    });
    
    if (expired.length > 0) {
      this.saveNotifications();
    }
  }
}
export const notificationService = new NotificationServiceClass();

class MeetingNotificationServiceClass {
  constructor(){ this.activeMeetings=new Map(); this.participantStatus=new Map(); }
  registerMeeting(appointmentId,meetingUrl,doctorInfo,patientInfo){ const data={ appointmentId,meetingUrl,doctor:doctorInfo,patient:patientInfo,createdAt:new Date().toISOString(), participants:{ doctor:{joined:false,joinedAt:null}, patient:{joined:false,joinedAt:null} } }; this.activeMeetings.set(appointmentId,data); return data }
  async participantJoined(appointmentId,role){ const meeting=this.activeMeetings.get(appointmentId); if(!meeting) return; meeting.participants[role].joined=true; meeting.participants[role].joinedAt=new Date().toISOString(); const otherRole=role==='doctor'?'patient':'doctor'; const other=meeting.participants[otherRole]; if(!other.joined){ await this.sendWaitingNotification(meeting,role,otherRole); } this.activeMeetings.set(appointmentId,meeting); }
  async sendWaitingNotification(meeting,joinedRole,targetRole){ const title= targetRole==='doctor'?'👤 Patient Waiting in Meeting':'👨‍⚕️ Doctor Waiting in Meeting'; const body= targetRole==='doctor'?`${meeting.patient.name} has joined the Google Meet and is waiting for you.`:`${meeting.doctor.name} has joined the Google Meet and is waiting for you.`; await notificationService.addToNotificationHistory({ id:`waiting-${meeting.appointmentId}-${Date.now()}`, type:'meeting_waiting', title, message:body, timestamp:new Date().toISOString() }); }
  async scheduleMeetingReminders(appointmentId, appointmentDateTime, doctorInfo, patientInfo){ const result={ doctorReminder:{ id:`reminder-doctor-${appointmentId}` }, patientReminder:{ id:`reminder-patient-${appointmentId}` } }; return result }
  async handleNotificationTap(data){ /* no-op simple inline */ }
  async sendNotification(notificationData){ await notificationService.addToNotificationHistory({ id:notificationData.id, type:'meeting', title:notificationData.title, message:notificationData.body, timestamp:new Date().toISOString() }); return true }
  getMeetingStatus(appointmentId){ return this.activeMeetings.get(appointmentId) }
  completeMeeting(appointmentId){ const m=this.activeMeetings.get(appointmentId); if(m){ m.completedAt=new Date().toISOString(); } return m }
  removeMeeting(appointmentId){ return this.activeMeetings.delete(appointmentId) }
  getActiveMeetings(){ return Array.from(this.activeMeetings.values()) }
}
export const meetingNotificationService = new MeetingNotificationServiceClass();

// Inline ChatService
class ChatServiceClass {
  constructor() {
    this.activeChats = new Map();
    this.messageListeners = new Map();
    this.connectionStatus = 'disconnected';
    this.currentUserId = null;
    this.chatListeners = [];
    this.setupTelnyxListeners();
  }

  setupTelnyxListeners() {
    telnyxService.addEventListener('incomingCall', (call) => {
      this.handleIncomingCall(call);
    });
    telnyxService.addEventListener('callStateChanged', ({ state, call }) => {
      this.handleCallStateChanged(state, call);
    });
    telnyxService.addEventListener('connected', () => {
      console.log('ChatService: Telnyx connected');
    });
    telnyxService.addEventListener('error', (error) => {
      console.error('ChatService: Telnyx error:', error);
    });
  }

  handleIncomingCall(call) {
    const callerNumber = call.callerNumber || call.from;
    const callerName = call.callerName || 'Unknown';
    notificationService.showCallNotification(callerName, 'voice', call.callId);
    this.notifyChatListeners('incomingCall', {
      callId: call.callId,
      callerName,
      callerNumber,
      call
    });
  }

  handleCallStateChanged(state, call) {
    this.notifyChatListeners('callStateChanged', {
      state,
      call,
      callId: call.callId
    });
    if (call.callerNumber || call.destinationNumber) {
      const otherNumber = call.direction === 'inbound' 
        ? call.callerNumber 
        : call.destinationNumber;
      const chat = this.findChatByPhoneNumber(otherNumber);
      if (chat) {
        this.addCallMessageToChat(chat.id, state, call);
      }
    }
  }

  findChatByPhoneNumber(phoneNumber) {
    for (let chat of this.activeChats.values()) {
      if (chat.phoneNumber === phoneNumber) {
        return chat;
      }
    }
    return null;
  }

  addCallMessageToChat(chatId, callState, call) {
    const chat = this.activeChats.get(chatId);
    if (!chat) return;

    let messageText = '';
    let messageType = 'call_update';

    switch (callState) {
      case 'initiated':
        messageText = call.direction === 'inbound' 
          ? 'Incoming call' 
          : 'Outgoing call';
        messageType = 'call_start';
        break;
      case 'active':
        messageText = 'Call started';
        break;
      case 'ended':
        const duration = call.duration || 0;
        messageText = `Call ended (${this.formatCallDuration(duration)})`;
        messageType = 'call_end';
        break;
      default:
        messageText = `Call ${callState}`;
    }

    const message = {
      id: this.generateMessageId(),
      chatId,
      senderId: call.direction === 'inbound' ? chat.otherParticipant.id : this.currentUserId,
      senderName: call.direction === 'inbound' ? chat.otherParticipant.name : 'You',
      text: messageText,
      type: messageType,
      timestamp: new Date().toISOString(),
      status: 'sent',
      readBy: [this.currentUserId],
      callData: {
        callId: call.callId,
        duration: call.duration,
        direction: call.direction
      }
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    chat.lastActivity = message.timestamp;

    this.activeChats.set(chatId, chat);
    this.saveChats();
    this.notifyMessageListeners(chatId, message);
  }

  formatCallDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  async initialize(userId, telnyxConfig = null) {
    try {
      this.currentUserId = userId;
      await this.loadChats();
      
      if (telnyxConfig) {
        await telnyxService.initialize(telnyxConfig);
        await telnyxService.connect();
      }
      
      this.connectionStatus = 'connected';
      console.log('Chat Service initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      throw error;
    }
  }

  async loadChats() {
    try {
      const chatsData = await AsyncStorage.getItem(`chats_${this.currentUserId}`);
      if (chatsData) {
        const chats = JSON.parse(chatsData);
        this.activeChats = new Map(Object.entries(chats));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }

  async saveChats() {
    try {
      const chatsObject = Object.fromEntries(this.activeChats);
      await AsyncStorage.setItem(`chats_${this.currentUserId}`, JSON.stringify(chatsObject));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  async createChat(participantId, participantName, participantType, phoneNumber = null) {
    try {
      const existingChat = this.findExistingChat(participantId);
      if (existingChat) {
        console.log('📱 Found existing chat:', existingChat.id);
        return existingChat;
      }

      const chatId = this.generateChatId(participantId);
      
      const chat = {
        id: chatId,
        participants: [
          { id: this.currentUserId, name: 'You', type: 'current_user' },
          { id: participantId, name: participantName, type: participantType, phoneNumber: phoneNumber }
        ],
        otherParticipant: { id: participantId, name: participantName, type: participantType },
        messages: [],
        lastMessage: null,
        lastActivity: new Date().toISOString(),
        isRead: true,
        unreadCount: 0,
        phoneNumber: phoneNumber
      };

      this.activeChats.set(chatId, chat);
      await this.saveChats();
      this.notifyChatListeners('chatCreated', chat);
      console.log('💬 Chat created for participant:', participantName);
      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  findExistingChat(participantId) {
    for (let chat of this.activeChats.values()) {
      const otherParticipant = chat.participants.find(p => p.id !== this.currentUserId);
      if (otherParticipant && otherParticipant.id === participantId) {
        return chat;
      }
    }
    return null;
  }

  generateChatId(participantId = null) {
    if (participantId) {
      const sortedIds = [this.currentUserId, participantId].sort();
      return `chat_${sortedIds.join('_')}`;
    }
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(chatId, messageText, messageType = 'text') {
    try {
      const chat = this.activeChats.get(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      const message = {
        id: this.generateMessageId(),
        chatId,
        senderId: this.currentUserId,
        senderName: 'You',
        text: messageText,
        type: messageType,
        timestamp: new Date().toISOString(),
        status: 'sent',
        readBy: [this.currentUserId]
      };

      chat.messages.push(message);
      chat.lastMessage = message;
      chat.lastActivity = message.timestamp;

      this.activeChats.set(chatId, chat);
      await this.saveChats();
      this.notifyMessageListeners(chatId, message);

      console.log('💬 Message sent:', message.text);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToMessages(chatId, callback) {
    if (!this.messageListeners.has(chatId)) {
      this.messageListeners.set(chatId, []);
    }
    
    this.messageListeners.get(chatId).push(callback);
    
    return () => {
      const listeners = this.messageListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  notifyMessageListeners(chatId, message) {
    const listeners = this.messageListeners.get(chatId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in message listener:', error);
        }
      });
    }
  }

  async markMessagesAsRead(chatId, messageIds = null) {
    const chat = this.activeChats.get(chatId);
    if (!chat) return;

    if (messageIds) {
      chat.messages.forEach(message => {
        if (messageIds.includes(message.id) && !message.readBy.includes(this.currentUserId)) {
          message.readBy.push(this.currentUserId);
        }
      });
    } else {
      chat.messages.forEach(message => {
        if (!message.readBy.includes(this.currentUserId)) {
          message.readBy.push(this.currentUserId);
        }
      });
      chat.unreadCount = 0;
    }

    this.activeChats.set(chatId, chat);
    await this.saveChats();
  }

  getChatMessages(chatId, limit = 50, offset = 0) {
    const chat = this.activeChats.get(chatId);
    if (!chat) return [];
    const messages = chat.messages.slice(offset, offset + limit);
    return messages.reverse();
  }

  getAllChats() {
    return Array.from(this.activeChats.values()).sort((a, b) => {
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  addChatListener(callback) {
    this.chatListeners.push(callback);
  }

  removeChatListener(callback) {
    const index = this.chatListeners.indexOf(callback);
    if (index > -1) {
      this.chatListeners.splice(index, 1);
    }
  }

  notifyChatListeners(event, data) {
    this.chatListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in chat listener:', error);
      }
    });
  }

  async deleteChat(chatId) {
    if (this.activeChats.has(chatId)) {
      this.activeChats.delete(chatId);
      this.messageListeners.delete(chatId);
      await this.saveChats();
      return true;
    }
    return false;
  }

  searchMessages(query, chatId = null) {
    const results = [];
    const chatsToSearch = chatId ? [this.activeChats.get(chatId)] : Array.from(this.activeChats.values());
    
    chatsToSearch.forEach(chat => {
      if (!chat) return;
      
      chat.messages.forEach(message => {
        if (message.text.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            ...message,
            chatId: chat.id,
            chatName: chat.participants.find(p => p.id !== this.currentUserId)?.name || 'Unknown'
          });
        }
      });
    });
    
    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  disconnect() {
    this.connectionStatus = 'disconnected';
    this.messageListeners.clear();
    console.log('Chat Service disconnected');
  }

  // Call-related methods using telnyxService
  async initiateVoiceCall(chatId, phoneNumber = null) {
    try {
      const chat = this.activeChats.get(chatId);
      if (!chat) throw new Error('Chat not found');

      const destinationNumber = phoneNumber || chat.phoneNumber || chat.participants.find(p => p.id !== this.currentUserId)?.phoneNumber;
      
      if (!destinationNumber) {
        throw new Error('No phone number available for this contact');
      }

      if (!telnyxService.getCurrentCallState().isConnected) {
        throw new Error('Not connected to calling service. Please check your connection.');
      }

      const call = await telnyxService.makeCall(destinationNumber, 'Professional', null);
      await this.sendMessage(chatId, 'Voice call initiated', 'call_start');
      
      console.log('Voice call initiated:', call.callId);
      
      return {
        callId: call.callId,
        type: 'voice',
        destinationNumber,
        status: 'initiating',
        telnyxCall: call
      };
    } catch (error) {
      console.error('Error initiating voice call:', error);
      throw error;
    }
  }

  async answerCall(callId) {
    try {
      const success = telnyxService.answerCall();
      if (success) {
        console.log('Call answered:', callId);
        return { success: true, callId };
      } else {
        throw new Error('Failed to answer call');
      }
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  async endCall(callId, duration = 0) {
    try {
      const success = telnyxService.endCall();
      if (success) {
        console.log('Call ended:', callId);
        return { callId, status: 'ended', duration, endTime: new Date().toISOString() };
      } else {
        throw new Error('Failed to end call');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }

  getCurrentCall() {
    const callState = telnyxService.getCurrentCallState();
    if (callState.hasActiveCall) {
      return {
        callId: telnyxService.activeCall?.callId,
        state: callState.callState,
        direction: callState.callDirection,
        streams: telnyxService.getCallStreams()
      };
    }
    return null;
  }

  async toggleMute() {
    return telnyxService.toggleMute();
  }
}

export const chatService = new ChatServiceClass();

export { telnyxService, googleMeetService };

// Inline Paystack helpers
export const PAYSTACK_PUBLIC_KEY = paystackPublicKey;
export const generateReference = () => `PR-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
export const mockVerifyTransaction = (reference) => Promise.resolve({ status: 'success', reference, amount: 0 });
export const mockUpdateWalletBalance = (userId, amount) => Promise.resolve({ success: true, newBalance: amount });
export const initializeTransaction = async (amount, email, reference, metadata = {}) => {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, amount: amount * 100, reference, metadata }),
  });
  return await response.json();
};
export const verifyTransaction = async (reference) => {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}` },
  });
  return await response.json();
};
export const paystack = { PAYSTACK_PUBLIC_KEY, generateReference, mockVerifyTransaction, mockUpdateWalletBalance, initializeTransaction, verifyTransaction };

// (Replaced by inlined class above)

// Inline Doctor service (lightweight)
class DoctorServiceClass {
  constructor() { this.currentDoctor = null; this.isInitialized = false; }
  initialize(doctorData) { this.currentDoctor = doctorData; this.isInitialized = true; }
  getCurrentDoctor() {
    if (!this.isInitialized || !this.currentDoctor) {
      return { id: '1', type: 'doctor', firstName: 'John', lastName: 'Smith', email: 'ikotnsikak@gmail.com', phone: '+1 (555) 123-4567', specialization: 'Internal Medicine', licenseNumber: 'MD123456' };
    }
    return this.currentDoctor;
  }
  getCurrentDoctorEmail() { return this.getCurrentDoctor().email; }
  getCurrentDoctorName() { const d = this.getCurrentDoctor(); return `Dr. ${d.firstName} ${d.lastName}`; }
  getCurrentDoctorContact() { const d = this.getCurrentDoctor(); return { email: d.email, phone: d.phone, name: `Dr. ${d.firstName} ${d.lastName}`, specialization: d.specialization, licenseNumber: d.licenseNumber }; }
  setCurrentDoctor(doctorData) { this.currentDoctor = doctorData; this.isInitialized = true; }
  clearCurrentDoctor() { this.currentDoctor = null; this.isInitialized = false; }
  isLoggedIn() { return this.isInitialized && this.currentDoctor !== null; }
}
export const doctorService = new DoctorServiceClass();

// Inline Email service (uses native composer)
class EmailServiceClass {
  constructor() { this.sentEmails = new Map(); this.emailQueue = []; this.isInitialized = true; this.emailConfig = { supportEmail: 'carepoint@gmail.com', noreplyEmail: 'carepoint@gmail.com', fromName: 'Carepoint Medical Center' }; }
  async initialize(){ this.isInitialized = true; return true; }
  async sendMeetingInvitation(doctorInfo, patientInfo, appointmentDetails, meetingUrl){
    const emailId = `meeting-${appointmentDetails.id}-${Date.now()}`;
    if (this.sentEmails.has(appointmentDetails.id)) { return this.sentEmails.get(appointmentDetails.id); }
    const patientEmailResult = await this.sendEmailToPatient(doctorInfo, patientInfo, appointmentDetails, meetingUrl);
    const doctorEmailResult = await this.sendEmailToDoctor(doctorInfo, patientInfo, appointmentDetails, meetingUrl);
    const emailRecord = { id: emailId, appointmentId: appointmentDetails.id, sentAt: new Date().toISOString(), recipients: [patientInfo.email, doctorInfo.email], meetingUrl, status: 'prepared', method: 'native_email', emailResults: { patient: patientEmailResult, doctor: doctorEmailResult } };
    this.sentEmails.set(appointmentDetails.id, emailRecord);
    return emailRecord;
  }
  async sendEmailToPatient(doctorInfo, patientInfo, appointmentDetails, meetingUrl){
    const subject = `Google Meet Invitation - Medical Consultation with ${doctorInfo.name}`;
    const body = this.createPatientEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl);
    try { await openComposer({ to: patientInfo.email, subject, body }); return { status: 'opened', method: 'native_email' }; }
    catch(_) { const mailtoUrl = this.createMailtoUrl(patientInfo.email, subject, body); try { await Linking.openURL(mailtoUrl); return { status: 'opened', method: 'mailto' }; } catch(e){ return { status: 'failed', method: 'none' }; } }
  }
  async sendEmailToDoctor(doctorInfo, patientInfo, appointmentDetails, meetingUrl){
    const subject = `Meeting Confirmation - Google Meet with ${patientInfo.name}`;
    const body = this.createDoctorEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl);
    return { status: 'prepared', method: 'prepared', emailData: { to: doctorInfo.email, subject, body } };
  }
  createPatientEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl){ return `Dear ${patientInfo.name},\n\nYou are invited to a medical consultation appointment via Google Meet.\n\n👨‍⚕️ DOCTOR INFORMATION:\n• Name: ${doctorInfo.name}\n• Specialization: ${doctorInfo.specialization || 'General Medicine'}\n• Email: ${doctorInfo.email}\n\n📅 APPOINTMENT DETAILS:\n• Date: ${appointmentDetails.date}\n• Time: ${appointmentDetails.time}\n• Duration: ${appointmentDetails.duration}\n• Type: ${appointmentDetails.type}\n\n🔗 JOIN GOOGLE MEET:\n${meetingUrl}\n\n📋 INSTRUCTIONS:\n1. Click the Google Meet link above at your appointment time\n2. Allow camera and microphone access when prompted\n3. Wait for the doctor to join if you arrive first\n4. Ensure you have a stable internet connection\n\n📞 SUPPORT:\nIf you have any technical issues, please contact us at ${this.emailConfig.supportEmail}\n\n⚕️ IMPORTANT NOTES:\n• Please join 2-3 minutes before the scheduled time\n• This consultation is confidential and will not be recorded\n• If you need to reschedule, please contact us 24 hours in advance\n\nBest regards,\n${doctorInfo.name}\n${this.emailConfig.fromName}`; }
  createDoctorEmailBody(doctorInfo, patientInfo, appointmentDetails, meetingUrl){ return `Dear ${doctorInfo.name},\n\nThis is a confirmation of the Google Meet consultation you've scheduled.\n\n👤 PATIENT INFORMATION:\n• Name: ${patientInfo.name}\n• Email: ${patientInfo.email}\n\n📅 APPOINTMENT DETAILS:\n• Date: ${appointmentDetails.date}\n• Time: ${appointmentDetails.time}\n• Duration: ${appointmentDetails.duration}\n• Type: ${appointmentDetails.type}\n\n🔗 GOOGLE MEET LINK:\n${meetingUrl}\n\n📋 MEETING STATUS:\n• The patient has been notified via email\n• Meeting link has been added to in-app chat\n• Notifications are set up for both parties\n\nThis is an automated confirmation email from the ${this.emailConfig.fromName}.\n\nBest regards,\n${this.emailConfig.fromName} Team`; }
  createMailtoUrl(to, subject, body){ const s=encodeURIComponent(subject); const b=encodeURIComponent(body); return `mailto:${to}?subject=${s}&body=${b}`; }
  async simulateEmailSending(doctorInfo, patientInfo, appointmentDetails, meetingUrl){ const emailRecord={ id:`meeting-${appointmentDetails.id}-${Date.now()}`, appointmentId:appointmentDetails.id, sentAt:new Date().toISOString(), recipients:[patientInfo.email, doctorInfo.email], meetingUrl, status:'simulated', method:'simulation' }; this.sentEmails.set(appointmentDetails.id,emailRecord); return emailRecord; }
  async sendEmail(to, subject, body){ try{ await openComposer({to,subject,body}); return { success:true, method:'native_email' } } catch(_){ try{ const mailtoUrl=this.createMailtoUrl(to,subject,body); await Linking.openURL(mailtoUrl); return { success:true, method:'mailto' } } catch(e){ return { success:false, error:e.message } } } }
  getEmailStatus(appointmentId){ return this.sentEmails.get(appointmentId); }
  wasEmailSent(appointmentId){ return this.sentEmails.has(appointmentId); }
  getAllSentEmails(){ return Array.from(this.sentEmails.values()); }
  clearEmailRecords(){ this.sentEmails.clear(); }
  async testEmailService(){ try{ return await this.sendEmail('test@example.com','Email Service Test','This is a test email to verify the email service integration.') } catch(e){ return { success:false, error:e.message } } }
  async isEmailAvailable(){ try{ return await Linking.canOpenURL('mailto:') } catch(_){ return false } }
}
export const emailService = new EmailServiceClass();

// Default export: convenience bundle
const api = {
  // base client
  ...ApiServiceDefault,
  isRetryableError,
  ApiError,

  // namespaces
  auth: AuthService,
  profile,
  appointments: undefined, // replaced below after class definition
  backendService: BackendService,
  healthData: HealthDataServiceDefault,
  healthActivity: HealthActivityServiceDefault,
  notificationService,
  meetingNotificationService,
  chatService,
  telnyxService,
  googleMeetService,
  paystack,
  userManagement: UserManagementService,
  doctorService,
  emailService,
};

export default api;
// Set appointments namespace if AppointmentService exists
try {
  // eslint-disable-next-line no-undef
  if (typeof AppointmentService !== 'undefined') {
    // @ts-ignore
    api.appointments = AppointmentService;
  }
} catch (e) {}
