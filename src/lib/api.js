import axios from 'axios';
import { AuthUtils } from './auth-utils';
import { ENV } from '../config/env';

// axios instance with base config
const BASE_URL = ENV?.API_URL || 'http://localhost:3000';
const API_KEY = ENV?.X_API_KEY;

const defaultHeaders = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { ...defaultHeaders },
  timeout: 30000,
});

const oauthApi = axios.create({
  baseURL: BASE_URL,
  headers: { ...defaultHeaders },
  timeout: 30000,
});

//refresh coordinate states (prevents multiple refresh calls racing)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error = null) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  );
  failedQueue = [];
};

// helper: normalize refresh response (server wraps data in SuccessResponse)
function extractTokenFromRefreshResponse(responseData) {
  const isObject = (v) => typeof v === 'object' && v !== null;
  const getString = (o, k) =>
    isObject(o) && typeof o[k] === 'string' ? o[k] : undefined;
  const getNumber = (o, k) =>
    isObject(o) && typeof o[k] === 'number' ? o[k] : undefined;

  const rd = isObject(responseData) ? responseData : undefined;
  const rdData = isObject(rd?.data) ? rd.data : undefined;
  const tokensNode = isObject(rdData?.tokens) ? rdData.tokens : undefined;

  //Standard success shape: {data: {tokens: {accessToken, refreshToken, accessExpiresAt}}}
  if (tokensNode) {
    const at = getString(tokensNode, 'accessToken');
    const rt = getString(tokensNode, 'refreshToken');
    const exp = getNumber(tokensNode, 'accessTokenExpiresIn');
    if (at && rt && typeof exp === 'number') {
      return { accessToken: at, refreshToken: rt, accessTokenExpiresIn: exp };
    }
  }

  //fallback: flattened response
  const accessToken =
    getString(rd, 'accessToken') || getString(rdData, 'accessToken');
  const refreshToken =
    getString(rd, 'refreshToken') || getString(rdData, 'refreshToken');
  const accessTokenExpiresIn =
    getNumber(rd, 'accessTokenExpiresIn') ||
    getNumber(rdData, 'accessTokenExpiresIn');

  return { accessToken, refreshToken, accessExpiresAt: accessTokenExpiresIn };
}

// Request interceptor" Attaches Authorization header if token is available
api.interceptors.request.use(
  async (config) => {
    const token = await AuthUtils.getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // always send api keys (already set in default headers)
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles token refresh and error responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;

    // only handle 401s (unauthorized) for retriable flows
    if (status === 401 && originalRequest && !originalRequest._retry) {
      //never refresh on these endpoints (avoid loops)
      const url = originalRequest.url || '';
      if (
        url.includes('/api/v1/login') ||
        url.includes('/api/v1/signup') ||
        url.includes('/api/v1/token/refresh') ||
        url.includes('/api/v1/reset-password') ||
        url.includes('/api/v1/forgot-password')
      ) {
        return Promise.reject(error);
      }

      // mark as retried
      originalRequest._retry = true;

      // if already refreshing, queue the request

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: async () => {
              try {
                const newAccessToken = await AuthUtils.getAccessToken();
                originalRequest.headers = originalRequest.headers || {};
                if (newAccessToken) {
                  originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                }
                resolve(api(originalRequest));
              } catch (error) {
                reject(error);
              }
            },
            reject: (error) => reject(error),
          });
        });
      }

      //Begin refresh flow
      isRefreshing = true;
      try {
        const refreshToken = await AuthUtils.getRefreshToken();
        if (!refreshToken) {
          await AuthUtils.clearTokens();
          processQueue(error);
          return Promise.reject(error);
        }

        // include API key; optionally include current access token if server requires it
        const currentAccessToken = await AuthUtils.getAccessToken();
        const refreshResponse = await oauthApi.post(
          '/api/v1/token/refresh',
          { refreshToken },
          {
            headers: {
              ...(currentAccessToken
                ? { Authorization: `Bearer ${currentAccessToken}` }
                : {}),
            },
          }
        );

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          accessTokenExpiresIn,
        } = extractTokenFromRefreshResponse(refreshResponse?.data) || {};

        if (newAccessToken && newRefreshToken && accessTokenExpiresIn) {
          await AuthUtils.storeTokens({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresIn: accessTokenExpiresIn,
          });
          // replay enqueued requests
          processQueue(null);

          // Retry the original request with new token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }

        throw new Error('Invalid token refresh response');
      } catch (error) {
        // failed refresh: cleanup and fail all queued requests
        await AuthUtils.clearTokens();
        processQueue(error);
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    // not a 401 we handle, propagate
    return Promise.reject(error);
  }
);

// Auth API (login/signup/refresh/logout/password)

export const authApi = {
  login: (email, password) => api.post('/api/v1/login', { email, password }),
  signup: (payload) => api.post('/api/v1/signup', payload),

  refreshToken: async (refreshToken) => {
    const currentAccessToken = await AuthUtils.getAccessToken();
    return oauthApi.post(
      '/api/v1/token/refresh',
      { refreshToken },
      {
        headers: {
          ...(currentAccessToken
            ? { Authorization: `Bearer ${currentAccessToken}` }
            : {}),
        },
      }
    );
  },
  logout: () => api.delete('/api/v1/logout'),
  forgotPassword: (email) => api.post('/api/v1/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.post('/api/v1/reset-password', { token, password }),
};

export const profileAPI = {
  me: () => api.get('/api/v1/profile/me'),
  update: (payload) => api.put('/api/v1/profile', payload),
};

export const referralsAPI = {
  create: (payload) => api.post('/api/v1/referrals', payload),
  getById: (id) => api.get(`/api/v1/referrals/${id}`),
  updateStatus: (id, payload) =>
    api.put(`/api/v1/referrals/${id}/status`, payload),
  listByDoctor: (doctorId) =>
    api.get(`/api/v1/referrals/doctors/${doctorId}/referrals`),
  listByPatient: (patientId) =>
    api.get(`/api/v1/referrals/patients/${patientId}/referrals`),
};

export const patientApi = {
  getById: (patientId) => api.get(`/api/v1/patients/${patientId}`),
  getByUserId: (userId) => api.get(`/api/v1/patients/by-user/${userId}`),
  getMyProfile: () => api.get('/api/v1/patients/profile/me'),
  update: (patientId, updates) =>
    api.put(`/api/v1/patients/${patientId}`, updates),

  //Allergies
  getAllergies: (patientId) =>
    api.get(`/api/v1/patients/${patientId}/allergies`),
  updateAllergies: (patientId, allergies) =>
    api.put(`/api/v1/patients/${patientId}/allergies`, { allergies }),

  // Medical history
  getMedicalHistory: (patientId) =>
    api.get(`/api/v1/patients/${patientId}/medical-history`),
  addMedicalHistory: (patientId, entry) =>
    api.post(`/api/v1/patients/${patientId}/medical-history`, entry),
  updateMedicalHistory: (patientId, entryId, entry) =>
    api.put(`/api/v1/patients/${patientId}/medical-history/${entryId}`, entry),

  // Appointments (patient-scoped)
  getAppointments: (patientId, params = {}) =>
    api.get(`/api/v1/patients/${patientId}/appointments`, { params }),
  createAppointment: (patientId, payload) =>
    api.post(`/api/v1/patients/${patientId}/appointments`, payload),
  updateAppointment: (patientId, appointmentId, payload) =>
    api.put(
      `/api/v1/patients/${patientId}/appointments/${appointmentId}`,
      payload
    ),
  deleteAppointment: (patientId, appointmentId) =>
    api.delete(`/api/v1/patients/${patientId}/appointments/${appointmentId}`),

  // Medical records
  getMedicalRecords: (patientId, params) =>
    api.get(`/api/v1/patients/${patientId}/medical-records`, { params }),
  createMedicalRecord: (patientId, payload) =>
    api.post(`/api/v1/patients/${patientId}/medical-records`, payload),
  updateMedicalRecord: (patientId, recordId, payload) =>
    api.put(
      `/api/v1/patients/${patientId}/medical-records/${recordId}`,
      payload
    ),

  //Prescriptions
  getPrescriptions: (patientId) =>
    api.get(`/api/v1/patients/${patientId}/prescriptions`),
  createPrescription: (patientId, payload) =>
    api.post(`/api/v1/patients/${patientId}/prescriptions`, payload),
  updatePrescription: (patientId, prescriptionId, payload) =>
    api.put(
      `/api/v1/patients/${patientId}/prescriptions/${prescriptionId}`,
      payload
    ),
  deletePrescription: (patientId, prescriptionId) =>
    api.delete(`/api/v1/patients/${patientId}/prescriptions/${prescriptionId}`),

  // Vitals
  addVitals: (patientId, payload) =>
    api.post(`/api/v1/patients/${patientId}/vitals`, payload),
  getVitalsHistory: (patientId, params = {}) =>
    api.get(`/api/v1/patients/${patientId}/vitals-history`, { params }),

  // Insurance (patient-scoped)
  getInsurance: (patientId) =>
    api.get(`/api/v1/patients/${patientId}/insurance`),
  updateInsurance: (patientId, insuranceId, payload) =>
    api.put(`/api/v1/patients/${patientId}/insurance/${insuranceId}`, payload),

  // Family members
  getFamilyMembers: (patientId, params = {}) =>
    api.get(`/api/v1/patients/${patientId}/family-members`, { params }),
  addFamilyMember: (patientId, payload) =>
    api.post(`/api/v1/patients/${patientId}/family-members`, payload),
};

// Doctors API
export const doctorsAPI = {
  search: (params = {}) => api.get('/api/v1/doctors', { params }),
  getById: (doctorId) => api.get(`/api/v1/doctors/${doctorId}`),
  update: (doctorId, updates) =>
    api.put(`/api/v1/doctors/${doctorId}`, updates),

  // Availability
  getAvailability: (doctorId) =>
    api.get(`/api/v1/doctors/${doctorId}/availability`),
  updateAvailability: (doctorId, availability) =>
    api.put(`/api/v1/doctors/${doctorId}/availability`, { availability }),

  // Doctor’s appointments / patients / reviews / specialization
  getAppointments: (doctorId) =>
    api.get(`/api/v1/doctors/${doctorId}/appointments`),
  getPatients: (doctorId) => api.get(`/api/v1/doctors/${doctorId}/patients`),
  getReviews: (doctorId) => api.get(`/api/v1/doctors/${doctorId}/reviews`),
  getSpecialization: (doctorId) =>
    api.get(`/api/v1/doctors/${doctorId}/specialization`),
  updateSpecialization: (doctorId, specialization) =>
    api.put(`/api/v1/doctors/${doctorId}/specialization`, { specialization }),

  // Global list of specializations
  getAllSpecializations: () => api.get('/api/v1/doctors/specializations'),
};

// Appointments API (global)
export const appointmentsAPI = {
  list: (params = {}) => api.get('/api/v1/appointments', { params }),
  create: (payload) => api.post('/api/v1/appointments', payload),
  update: (appointmentId, updates) =>
    api.put(`/api/v1/appointments/${appointmentId}`, updates),
  delete: (appointmentId) =>
    api.delete(`/api/v1/appointments/${appointmentId}`),

  // Status, reschedule, slots, availability, check-in
  updateStatus: (appointmentId, status) =>
    api.put(`/api/v1/appointments/${appointmentId}/status`, { status }),
  reschedule: (appointmentId, payload) =>
    api.post(`/api/v1/appointments/${appointmentId}/reschedule`, payload),
  getSlotsForDoctor: (doctorId, params) =>
    api.get(`/api/v1/appointments/slots/doctor/${doctorId}`, { params }),
  getSlotsForAppointment: (appointmentId, params) =>
    api.get(`/api/v1/appointments/slots/appointment/${appointmentId}`, {
      params,
    }),
  getAvailabilityForAppointment: (appointmentId, params) =>
    api.get(`/api/v1/appointments/${appointmentId}/availability`, { params }),
  checkIn: (appointmentId, checkInTime) =>
    api.post(`/api/v1/appointments/${appointmentId}/check-in`, { checkInTime }),
};

// Notifications API
export const notificationsAPI = {
  list: (params = {}) => api.get('/api/v1/notifications', { params }),
  create: (payload) => api.post('/api/v1/notifications', payload),
  markAsRead: (id) => api.put(`/api/v1/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/v1/notifications/read-all'),
  getSettings: () => api.get('/api/v1/notifications/settings'),
  updateSettings: (settings) =>
    api.put('/api/v1/notifications/settings', settings),
};

//  Calendar API
export const calendarAPI = {
  checkAvailability: (params) =>
    api.get('/api/v1/calendar/availability', { params }),

  // Events
  getEvents: (params = {}) => api.get('/api/v1/calendar/events', { params }),
  createEvent: (payload) => api.post('/api/v1/calendar/events', payload),
  updateEvent: (eventId, updates) =>
    api.put(`/api/v1/calendar/events/${eventId}`, updates),
  deleteEvent: (eventId) => api.delete(`/api/v1/calendar/events/${eventId}`),

  // User calendar
  getUserCalendar: (userId, params = {}) =>
    api.get(`/api/v1/calendar/${userId}`, { params }),
};

//  Mobile API
export const mobileAPI = {
  registerDevice: (payload) => api.post('/api/v1/mobile/devices', payload),
  deleteDevice: (id) => api.delete(`/api/v1/mobile/devices/${id}`),
  updatePushToken: (id, pushToken) =>
    api.put(`/api/v1/mobile/devices/${id}/token`, { pushToken }),
  getDevices: () => api.get('/api/v1/mobile/devices'),
  getConfig: () => api.get('/api/v1/mobile/config'),
};

export const pharmaciesAPI = {
  // List and detail
  list: (params = {}) => api.get('/api/v1/pharmacies', { params }),
  getById: (pharmacyId) => api.get(`/api/v1/pharmacies/${pharmacyId}`),
  update: (pharmacyId, updates) =>
    api.put(`/api/v1/pharmacies/${pharmacyId}`, updates),

  // Inventory under a pharmacy
  inventory: {
    list: (pharmacyId, params = {}) =>
      api.get(`/api/v1/pharmacies/${pharmacyId}/inventory`, { params }),
    create: (pharmacyId, payload) =>
      api.post(`/api/v1/pharmacies/${pharmacyId}/inventory`, payload),
    update: (pharmacyId, itemId, payload) =>
      api.put(`/api/v1/pharmacies/${pharmacyId}/inventory/${itemId}`, payload),
    delete: (pharmacyId, itemId) =>
      api.delete(`/api/v1/pharmacies/${pharmacyId}/inventory/${itemId}`),
  },

  // Medications under a pharmacy (search + details)
  medications: {
    search: (pharmacyId, params = {}) =>
      api.get(`/api/v1/pharmacies/${pharmacyId}/medications`, { params }),
    getById: (pharmacyId, id) =>
      api.get(`/api/v1/pharmacies/${pharmacyId}/medications/${id}`),
  },

  // Orders under a pharmacy
  orders: {
    create: (pharmacyId, payload) =>
      api.post(`/api/v1/pharmacies/${pharmacyId}/orders`, payload),
    list: (pharmacyId, params = {}) =>
      api.get(`/api/v1/pharmacies/${pharmacyId}/orders`, { params }),
  },

  // Prescriptions received by a pharmacy
  prescriptions: {
    create: (pharmacyId, payload) =>
      api.post(`/api/v1/pharmacies/${pharmacyId}/prescriptions`, payload),
    list: (pharmacyId, params = {}) =>
      api.get(`/api/v1/pharmacies/${pharmacyId}/prescriptions`, { params }),
    updateStatus: (pharmacyId, prescriptionId, status) =>
      api.put(
        `/api/v1/pharmacies/${pharmacyId}/prescriptions/${prescriptionId}`,
        { status }
      ),
  },

  // Analytics and sales reports
  analytics: (pharmacyId, params) =>
    api.get(`/api/v1/pharmacies/${pharmacyId}/analytics`, { params }),
  sales: (pharmacyId, params) =>
    api.get(`/api/v1/pharmacies/${pharmacyId}/sales`, { params }),
};

export const telemedicineAPI = {
  // Sessions
  createSession: (payload) =>
    api.post('/api/v1/telemedicine/sessions', payload),
  getSession: (id) => api.get(`/api/v1/telemedicine/sessions/${id}`),

  // Session status
  updateStatus: (id, status) =>
    api.put(`/api/v1/telemedicine/sessions/${id}/status`, { status }),

  // Connection token
  getToken: (id) => api.get(`/api/v1/telemedicine/sessions/${id}/token`),

  // Recording
  toggleRecording: (id, isRecording) =>
    api.post(`/api/v1/telemedicine/sessions/${id}/recording`, { isRecording }),

  // Chat
  chat: {
    list: (id, params = {}) =>
      api.get(`/api/v1/telemedicine/sessions/${id}/chat`, { params }),
    send: (id, message) =>
      api.post(`/api/v1/telemedicine/sessions/${id}/chat`, { message }),
  },
};

export const documentsAPI = {
  upload: (file, metadata) => {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name || 'document',
    });
    form.append('metadata', JSON.stringify(metadata));
    return api.post('/api/v1/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadTemplate: (file, metadata) => {
    const form = new FormData();
    form.append('file', {
      uri: file.uri,
      type: file.type || 'application/octet-stream',
      name: file.name || 'template',
    });
    form.append('metadata', JSON.stringify(metadata));
    return api.post('/api/v1/documents/templates', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  generateFromTemplate: (templateId, data, outputFormat = 'PDF') =>
    api.post('/api/v1/documents/generate', {
      templateId,
      data,
      outputFormat: (outputFormat || 'PDF').toUpperCase(),
    }),
  listTemplates: (params = {}) =>
    api.get('/api/v1/documents/templates', { params }),
  getById: (id) => api.get(`/api/v1/documents/${id}`),
  updateMetadata: (id, metadata) =>
    api.put(`/api/v1/documents/${id}/metadata`, { metadata }),
};

export const prescriptionsAPI = {
  // Global
  list: (params = {}) => api.get('/api/v1/prescriptions', { params }),
  create: (payload) => api.post('/api/v1/prescriptions', payload),
  getById: (prescriptionId) =>
    api.get(`/api/v1/prescriptions/${prescriptionId}`),
  update: (prescriptionId, updates) =>
    api.put(`/api/v1/prescriptions/${prescriptionId}`, updates),
  updateStatus: (prescriptionId, status) =>
    api.put(`/api/v1/prescriptions/${prescriptionId}/status`, { status }),
  requestRefill: (prescriptionId, payload) =>
    api.post(`/api/v1/prescriptions/${prescriptionId}/refill`, payload),

  // Pharmacy-scoped actions mounted under global prescriptions router
  verifyForPharmacy: (pharmacyId, prescriptionId, payload) =>
    api.post(
      `/api/v1/prescriptions/${pharmacyId}/prescriptions/${prescriptionId}/verify`,
      payload
    ),
  dispenseForPharmacy: (pharmacyId, prescriptionId, payload) =>
    api.post(
      `/api/v1/prescriptions/${pharmacyId}/prescriptions/${prescriptionId}/dispense`,
      payload
    ),
  historyForPharmacy: (pharmacyId, prescriptionId) =>
    api.get(
      `/api/v1/prescriptions/${pharmacyId}/prescriptions/${prescriptionId}/history`
    ),
};

export const reportsAPI = {
  generate: (payload) => api.post('/api/v1/reports/generate', payload),
  templates: () => api.get('/api/v1/reports/templates'),

  exportAppointments: (params = {}) =>
    api.get('/api/v1/reports/exports/appointments', {
      params,
      responseType: 'arraybuffer',
    }),
  exportPatients: (params = {}) =>
    api.get('/api/v1/reports/exports/patients', {
      params,
      responseType: 'arraybuffer',
    }),
  exportInventory: (params = {}) =>
    api.get('/api/v1/reports/exports/inventory', {
      params,
      responseType: 'arraybuffer',
    }),
  exportSales: (params = {}) =>
    api.get('/api/v1/reports/exports/sales', {
      params,
      responseType: 'arraybuffer',
    }),
};

export const searchAPI = {
  doctors: (params = {}) => api.get('/api/v1/search/doctors', { params }),
  pharmacies: (params = {}) => api.get('/api/v1/search/pharmacies', { params }),
  medications: (params = {}) =>
    api.get('/api/v1/search/medications', { params }),
  services: (params = {}) => api.get('/api/v1/search/services', { params }),
  nearby: (params = {}) => api.get('/api/v1/search/nearby', { params }),
};

export const medicationsAPI = {
  search: (params = {}) => api.get('/api/v1/medications', { params }),
  getById: (id) => api.get(`/api/v1/medications/${id}`),
  getCategories: () => api.get('/api/v1/medications/categories'),
  getAlternatives: (id) => api.get(`/api/v1/medications/${id}/alternatives`),
  getInteractions: (id) => api.get(`/api/v1/medications/${id}/interactions`),
  getAvailability: (id) => api.get(`/api/v1/medications/${id}/availability`),
};

// Ambulance Services
export const ambulanceAPI = {
  // List and detail
  list: () => api.get('/api/v1/ambulance-services'),
  getById: (ambulanceId) =>
    api.get(`/api/v1/ambulance-services/${ambulanceId}`),

  // Coverage (ambulanceAuth derives ambulanceId server-side)
  coverage: {
    add: (payload) => api.post('/api/v1/ambulance-services/coverage', payload),
    update: (coverageId, payload) =>
      api.put(`/api/v1/ambulance-services/coverage/${coverageId}`, payload),
    remove: (coverageId) =>
      api.delete(`/api/v1/ambulance-services/coverage/${coverageId}`),
    getOne: (coverageId) =>
      api.get(`/api/v1/ambulance-services/coverage/${coverageId}`),
  },

  // Location (requires explicit ambulanceId in path)
  location: {
    get: (ambulanceId) =>
      api.get(`/api/v1/ambulance-services/${ambulanceId}/location`),
    update: (ambulanceId, payload) =>
      api.put(`/api/v1/ambulance-services/${ambulanceId}/location`, payload),
  },

  // Emergency requests
  emergency: {
    create: (payload) =>
      api.post('/api/v1/ambulance-services/emergency-requests', payload),
    nearby: (params = {}) =>
      api.get('/api/v1/ambulance-services/emergency-requests/nearby', {
        params,
      }),
    getById: (id) =>
      api.get(`/api/v1/ambulance-services/emergency-requests/${id}`),
    updateStatus: (id, payload) =>
      api.put(
        `/api/v1/ambulance-services/emergency-requests/${id}/status`,
        payload
      ),
  },
};

// Analytics
export const analyticsAPI = {
  patients: (params = {}) => api.get('/api/v1/analytics/patients', { params }),
  doctors: (params = {}) => api.get('/api/v1/analytics/doctors', { params }),
  pharmacies: (params = {}) =>
    api.get('/api/v1/analytics/pharmacies', { params }),
  appointments: (params = {}) =>
    api.get('/api/v1/analytics/appointments', { params }),
  revenue: (params = {}) => api.get('/api/v1/analytics/revenue', { params }),
  trends: (params = {}) => api.get('/api/v1/analytics/trends', { params }),
  generateReports: (params = {}) =>
    api.get('/api/v1/analytics/generate-reports', { params }),
  dashboard: (type, params = {}) =>
    api.get(`/api/v1/analytics/dashboards/${type}`, { params }),
};

// Messages (secure communications)
export const messagesAPI = {
  // Messages
  list: (params = {}) => api.get('/api/v1/messages', { params }),
  getById: (id) => api.get(`/api/v1/messages/${id}`),
  send: (payload) => api.post('/api/v1/messages', payload),
  updateStatus: (id, status) =>
    api.put(`/api/v1/messages/${id}/status`, { status }),

  // Unread and conversations
  unreadCount: () => api.get('/api/v1/messages/unread/count'),
  conversations: () => api.get('/api/v1/messages/conversations'),
  getConversation: (id) => api.get(`/api/v1/messages/conversations/${id}`),

  // Broadcasts
  createBroadcast: (payload) =>
    api.post('/api/v1/messages/broadcast-messages', payload),
  listBroadcasts: (params = {}) =>
    api.get('/api/v1/messages/broadcast-messages', { params }),
  listBroadcastsAllStatuses: (params = {}) =>
    api.get('/api/v1/messages/broadcast-messages/all-statuses', { params }),
  debugBroadcasts: () => api.get('/api/v1/messages/broadcast-messages/debug'),
};

// Configuration (system settings, operational hours, holidays)
export const configurationAPI = {
  // Settings by category
  getSettings: (category) =>
    api.get(`/api/v1/configuration/settings/${category}`),
  updateSettings: (category, settings) =>
    api.put(`/api/v1/configuration/settings/${category}`, { settings }),

  // Operational hours
  getOperationalHours: () =>
    api.get('/api/v1/configuration/system/operational-hours'),
  updateOperationalHours: (payload) =>
    api.put('/api/v1/configuration/system/operational-hours', payload),

  // Holidays
  getHolidays: (params = {}) =>
    api.get('/api/v1/configuration/system/holidays', { params }),
  createHoliday: (payload) =>
    api.post('/api/v1/configuration/system/holidays', payload),
  updateHoliday: (id, payload) =>
    api.put(`/api/v1/configuration/system/holidays/${id}`, payload),
  deleteHoliday: (id) =>
    api.delete(`/api/v1/configuration/system/holidays/${id}`),
  getHolidayById: (id) =>
    api.get(`/api/v1/configuration/system/holidays/${id}`),
  checkHolidayDate: (dateISO) =>
    api.get(`/api/v1/configuration/system/holidays/check/${dateISO}`),
};

// Education (health education content)
export const educationAPI = {
  // Resources
  listResources: (params = {}) =>
    api.get('/api/v1/education/resources', { params }),
  getResource: (id) => api.get(`/api/v1/education/resources/${id}`),
  createResource: (payload) => api.post('/api/v1/education/resources', payload),

  // Categories
  listCategories: (params = {}) =>
    api.get('/api/v1/education/categories', { params }),
  createCategory: (payload) =>
    api.post('/api/v1/education/categories', payload),
  getCategory: (id) => api.get(`/api/v1/education/categories/${id}`),
  updateCategory: (id, payload) =>
    api.put(`/api/v1/education/categories/${id}`, payload),
  deleteCategory: (id) => api.delete(`/api/v1/education/categories/${id}`),

  // Personalized recommendations
  getPatientRecommendations: (patientId, params = {}) =>
    api.get(`/api/v1/education/patients/${patientId}/recommended-education`, {
      params,
    }),

  // Helpers
  popular: (params = {}) =>
    api.get('/api/v1/education/resources/popular', { params }),
  recent: (params = {}) =>
    api.get('/api/v1/education/resources/recent', { params }),
  metadata: () => api.get('/api/v1/education/metadata'),
};

// Insurance
export const insuranceAPI = {
  verifyCoverage: ({
    patientId,
    provider,
    policyNumber,
    serviceType,
    amount,
  }) =>
    api.post('/api/v1/insurance/verify', {
      patientId,
      provider,
      policyNumber,
      serviceType,
      amount,
    }),
  submitClaim: (payload) => api.post('/api/v1/insurance/claims', payload),
  getProviders: () => api.get('/api/v1/insurance/providers'),
  getCoverage: (params = {}) =>
    api.get('/api/v1/insurance/coverage', { params }),
  getClaim: (id) => api.get(`/api/v1/insurance/claims/${id}`),
};

// Inventory (transfers, stock takes, alerts)
export const inventoryAPI = {
  // Transfers
  createTransfer: (payload) => api.post('/api/v1/inventory/transfers', payload),
  listTransfers: (params = {}) =>
    api.get('/api/v1/inventory/transfers', { params }),
  getTransfer: (id) => api.get(`/api/v1/inventory/transfers/${id}`),
  approveTransfer: (id, payload) =>
    api.put(`/api/v1/inventory/transfers/${id}/approve`, payload),
  completeTransfer: (id, payload) =>
    api.put(`/api/v1/inventory/transfers/${id}/complete`, payload),
  cancelTransfer: (id, payload) =>
    api.put(`/api/v1/inventory/transfers/${id}/cancel`, payload),

  // Stock take
  createStockTake: (payload) =>
    api.post('/api/v1/inventory/stocktake', payload),
  listStockTakes: (params = {}) =>
    api.get('/api/v1/inventory/stocktake', { params }),
  getStockTake: (id) => api.get(`/api/v1/inventory/stocktake/${id}`),
  addStockTakeItems: (id, items) =>
    api.post(`/api/v1/inventory/stocktake/${id}/items`, { items }),
  updateStockTakeStatus: (id, status) =>
    api.put(`/api/v1/inventory/stocktake/${id}/status`, { status }),

  // Alerts
  lowStock: (params = {}) => api.get('/api/v1/inventory/low-stock', { params }),
  expiring: (params = {}) => api.get('/api/v1/inventory/expiring', { params }),
  alerts: (params = {}) => api.get('/api/v1/inventory/alerts', { params }),
};

// Laboratory
export const laboratoryAPI = {
  createLabOrder: (payload) =>
    api.post('/api/v1/laboratory/lab-orders', payload),
  getLabOrder: (id) => api.get(`/api/v1/laboratory/lab-orders/${id}`),
  updateLabOrderStatus: (id, status, notes) =>
    api.put(`/api/v1/laboratory/lab-orders/${id}/status`, { status, notes }),
  submitLabResults: (payload) =>
    api.post('/api/v1/laboratory/lab-results', payload),
  getLabResult: (id) => api.get(`/api/v1/laboratory/lab-results/${id}`),
  getPatientLabHistory: (patientId) =>
    api.get(`/api/v1/laboratory/patients/${patientId}/lab-results`),
};

// Medical Records (attachments)
export const medicalRecordsAPI = {
  addAttachments: (recordId, files) => {
    const form = new FormData();
    files.forEach((f, idx) => {
      form.append('attachments', {
        uri: f.uri,
        type: f.type || 'application/octet-stream',
        name: f.name || `attachment_${idx + 1}`,
      });
    });
    return api.post(`/api/v1/medical-records/${recordId}/attachments`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAttachments: (recordId) =>
    api.get(`/api/v1/medical-records/${recordId}/attachments`),
};

// Staff
export const staffAPI = {
  list: (params = {}) => api.get('/api/v1/staff', { params }),
  create: (payload) => api.post('/api/v1/staff', payload),
  getById: (id) => api.get(`/api/v1/staff/${id}`),
  update: (id, payload) => api.put(`/api/v1/staff/${id}`, payload),

  // Schedule
  getSchedule: (id) => api.get(`/api/v1/staff/${id}/schedule`),
  updateSchedule: (id, schedule) =>
    api.put(`/api/v1/staff/${id}/schedule`, { schedule }),

  // Roles
  createRole: (payload) => api.post('/api/v1/staff/roles', payload),
  listRoles: () => api.get('/api/v1/staff/roles'),
};
// Export default axios for raw calls if needed
export default api;
