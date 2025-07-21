import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Storage keys
const APPOINTMENTS_KEY = '@appointments';
const APPOINTMENT_NOTIFICATIONS_KEY = '@appointment_notifications';

// Appointment status types
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  RESCHEDULED: 'rescheduled',
};

// Appointment types
export const APPOINTMENT_TYPES = {
  CONSULTATION: 'consultation',
  FOLLOW_UP: 'follow-up',
  EMERGENCY: 'emergency',
  VIDEO_CALL: 'video-call',
  IN_PERSON: 'in-person',
};

/**
 * Unified Appointment Service
 * Manages appointments between patients and doctors with real-time sync
 */
class AppointmentService {
  constructor() {
    this.listeners = [];
    this.currentUser = null;
    this.currentUserRole = null; // 'patient' or 'doctor'
  }

  /**
   * Initialize the service with current user data
   */
  async initialize(user, role) {
    this.currentUser = user;
    this.currentUserRole = role;
    await this.loadInitialData();
  }

  /**
   * Load initial appointment data
   */
  async loadInitialData() {
    try {
      // Check if appointments already exist
      const existingAppointments = await this.getAllAppointments();
      
      if (existingAppointments.length === 0) {
        // Only initialize with demo data if no appointments exist
        await this.initializeDemoData();
        console.log('📅 Initialized with demo appointment data (no existing appointments found)');
      } else {
        console.log('📅 Found existing appointments, skipping demo data initialization');
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
    }
  }

  /**
   * Initialize with demo appointment data
   */
  async initializeDemoData() {
    const demoAppointments = [
      {
        id: 'apt_demo_1',
        patientId: 'patient_sageikot',
        patientName: 'Sageikot',
        patientEmail: 'sageikot@gmail.com',
        patientPhone: '+234 803 123 4567',
        doctorId: '1',
        doctorName: 'Dr. John Smith',
        doctorEmail: 'ikotnsikak@gmail.com',
        doctorSpecialty: 'Cardiology',
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        appointmentTime: '10:00 AM',
        duration: 30,
        type: APPOINTMENT_TYPES.CONSULTATION,
        status: APPOINTMENT_STATUS.PENDING,
        reason: 'Regular cardiac checkup',
        notes: 'Patient requesting routine cardiology consultation',
        bookingDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy: 'patient_sageikot',
        notifications: {
          reminderSent: false,
          statusChangeSent: false,
        },
      },
      {
        id: 'apt_demo_2',
        patientId: 'patient_judith',
        patientName: 'Judith Scoft',
        patientEmail: 'judith.scoft@gmail.com',
        patientPhone: '+234 803 987 6543',
        doctorId: '1',
        doctorName: 'Dr. John Smith',
        doctorEmail: 'ikotnsikak@gmail.com',
        doctorSpecialty: 'Cardiology',
        appointmentDate: new Date().toISOString(), // Today
        appointmentTime: '09:00 AM',
        duration: 30,
        type: APPOINTMENT_TYPES.FOLLOW_UP,
        status: APPOINTMENT_STATUS.PENDING,
        reason: 'Follow-up appointment for blood pressure monitoring',
        notes: 'Patient requesting follow-up consultation for hypertension management',
        bookingDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy: 'patient_judith',
        notifications: {
          reminderSent: false,
          statusChangeSent: false,
        },
      },
      {
        id: 'apt_demo_3',
        patientId: 'patient_samuel',
        patientName: 'Samuel Cole',
        patientEmail: 'samuel.cole@gmail.com',
        patientPhone: '+234 803 456 7890',
        doctorId: '1',
        doctorName: 'Dr. John Smith',
        doctorEmail: 'ikotnsikak@gmail.com',
        doctorSpecialty: 'Cardiology',
        appointmentDate: new Date().toISOString(), // Today
        appointmentTime: '02:00 PM',
        duration: 45,
        type: APPOINTMENT_TYPES.CONSULTATION,
        status: APPOINTMENT_STATUS.PENDING,
        reason: 'New patient consultation',
        notes: 'New patient with chest pain and shortness of breath',
        bookingDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        modifiedBy: 'patient_samuel',
        notifications: {
          reminderSent: false,
          statusChangeSent: false,
        },
      },
    ];

    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(demoAppointments));
  }

  /**
   * Create a new appointment (Patient booking)
   */
  async createAppointment(appointmentData) {
    try {
      const appointments = await this.getAllAppointments();
      
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
        notifications: {
          reminderSent: false,
          statusChangeSent: false,
        },
        changeHistory: [{
          action: 'created',
          timestamp: new Date().toISOString(),
          by: this.currentUser?.id || 'patient_sageikot',
          role: 'patient',
        }],
      };

      console.log('📅 Creating new appointment:', {
        id: newAppointment.id,
        doctorId: newAppointment.doctorId,
        patientName: newAppointment.patientName,
        appointmentDate: newAppointment.appointmentDate,
        appointmentTime: newAppointment.appointmentTime,
        status: newAppointment.status
      });

      appointments.push(newAppointment);
      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      
      console.log('📅 Appointment saved to storage. Total appointments:', appointments.length);
      
      // Notify listeners
      this.notifyListeners('appointment_created', newAppointment);
      console.log('📅 Appointment created event sent to listeners');
      
      // Send notification to doctor
      await this.sendNotificationToDoctor(newAppointment, 'new_appointment');
      
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  }

  /**
   * Update appointment status (Doctor action)
   */
  async updateAppointmentStatus(appointmentId, newStatus, notes = '') {
    try {
      const appointments = await this.getAllAppointments();
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      const appointment = appointments[appointmentIndex];
      const oldStatus = appointment.status;
      
      appointments[appointmentIndex] = {
        ...appointment,
        status: newStatus,
        lastModified: new Date().toISOString(),
        modifiedBy: this.currentUser?.id || appointment.doctorId,
        doctorNotes: notes,
        changeHistory: [
          ...(appointment.changeHistory || []),
          {
            action: `status_changed_${oldStatus}_to_${newStatus}`,
            timestamp: new Date().toISOString(),
            by: this.currentUser?.id || appointment.doctorId,
            role: 'doctor',
            notes: notes,
          }
        ],
      };

      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      
      // Notify listeners
      this.notifyListeners('appointment_updated', appointments[appointmentIndex]);
      
      // Send notification to patient
      await this.sendNotificationToPatient(appointments[appointmentIndex], 'status_change', oldStatus);
      
      return appointments[appointmentIndex];
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  }

  /**
   * Reschedule appointment (Doctor action)
   */
  async rescheduleAppointment(appointmentId, newDate, newTime, reason = '') {
    try {
      const appointments = await this.getAllAppointments();
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      const appointment = appointments[appointmentIndex];
      const oldDate = appointment.appointmentDate;
      const oldTime = appointment.appointmentTime;
      
      appointments[appointmentIndex] = {
        ...appointment,
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: APPOINTMENT_STATUS.RESCHEDULED,
        lastModified: new Date().toISOString(),
        modifiedBy: this.currentUser?.id || appointment.doctorId,
        rescheduleReason: reason,
        changeHistory: [
          ...(appointment.changeHistory || []),
          {
            action: 'rescheduled',
            timestamp: new Date().toISOString(),
            by: this.currentUser?.id || appointment.doctorId,
            role: 'doctor',
            oldDate: oldDate,
            oldTime: oldTime,
            newDate: newDate,
            newTime: newTime,
            reason: reason,
          }
        ],
      };

      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      
      // Notify listeners
      this.notifyListeners('appointment_rescheduled', appointments[appointmentIndex]);
      
      // Send notification to patient
      await this.sendNotificationToPatient(appointments[appointmentIndex], 'reschedule');
      
      return appointments[appointmentIndex];
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, reason = '') {
    try {
      const appointments = await this.getAllAppointments();
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      const appointment = appointments[appointmentIndex];
      
      appointments[appointmentIndex] = {
        ...appointment,
        status: APPOINTMENT_STATUS.CANCELLED,
        lastModified: new Date().toISOString(),
        modifiedBy: this.currentUser?.id || (this.currentUserRole === 'doctor' ? appointment.doctorId : appointment.patientId),
        cancellationReason: reason,
        changeHistory: [
          ...(appointment.changeHistory || []),
          {
            action: 'cancelled',
            timestamp: new Date().toISOString(),
            by: this.currentUser?.id || (this.currentUserRole === 'doctor' ? appointment.doctorId : appointment.patientId),
            role: this.currentUserRole,
            reason: reason,
          }
        ],
      };

      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      
      // Notify listeners
      this.notifyListeners('appointment_cancelled', appointments[appointmentIndex]);
      
      // Send notification to other party
      if (this.currentUserRole === 'doctor') {
        await this.sendNotificationToPatient(appointments[appointmentIndex], 'cancellation');
      } else {
        await this.sendNotificationToDoctor(appointments[appointmentIndex], 'cancellation');
      }
      
      return appointments[appointmentIndex];
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  }

  /**
   * Get all appointments
   */
  async getAllAppointments() {
    try {
      const stored = await AsyncStorage.getItem(APPOINTMENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  /**
   * Get appointments for current user
   */
  async getMyAppointments() {
    try {
      // Force refresh from storage to ensure we get the latest data
      const allAppointments = await this.getAllAppointments();
      
      console.log('📅 Getting appointments for user:', {
        role: this.currentUserRole,
        userId: this.currentUser?.id,
        totalAppointments: allAppointments.length,
        allAppointmentIds: allAppointments.map(apt => apt.id)
      });
      
      if (this.currentUserRole === 'doctor') {
        const doctorAppointments = allAppointments.filter(apt => apt.doctorId === this.currentUser?.id);
        console.log('📅 Doctor appointments found:', {
          doctorId: this.currentUser?.id,
          appointmentsFound: doctorAppointments.length,
          appointmentIds: doctorAppointments.map(apt => apt.id)
        });
        return doctorAppointments;
      } else {
        const patientAppointments = allAppointments.filter(apt => 
          apt.patientId === this.currentUser?.id || 
          apt.patientId === 'patient_sageikot' // For demo user
        );
        console.log('📅 Patient appointments found:', {
          patientId: this.currentUser?.id,
          appointmentsFound: patientAppointments.length,
          appointmentIds: patientAppointments.map(apt => apt.id)
        });
        return patientAppointments;
      }
    } catch (error) {
      console.error('Error getting my appointments:', error);
      return [];
    }
  }

  /**
   * Force refresh data from storage
   */
  async refreshData() {
    try {
      // Clear any cached data and reload from storage
      const allAppointments = await this.getAllAppointments();
      console.log('📅 Data refreshed from storage. Total appointments:', allAppointments.length);
      return allAppointments;
    } catch (error) {
      console.error('Error refreshing data:', error);
      return [];
    }
  }

  /**
   * Get appointments for a specific date
   */
  async getAppointmentsForDate(date) {
    try {
      const appointments = await this.getMyAppointments();
      const targetDate = new Date(date).toISOString().split('T')[0];
      
      return appointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
        return aptDate === targetDate;
      });
    } catch (error) {
      console.error('Error getting appointments for date:', error);
      return [];
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId) {
    try {
      const appointments = await this.getAllAppointments();
      return appointments.find(apt => apt.id === appointmentId);
    } catch (error) {
      console.error('Error getting appointment by ID:', error);
      return null;
    }
  }

  /**
   * Send notification to doctor
   */
  async sendNotificationToDoctor(appointment, type) {
    try {
      const notifications = await this.getStoredNotifications();
      
      let title = '';
      let body = '';
      
      switch (type) {
        case 'new_appointment':
          title = 'New Appointment Request';
          body = `${appointment.patientName} has requested an appointment for ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}`;
          break;
        case 'cancellation':
          title = 'Appointment Cancelled';
          body = `${appointment.patientName} has cancelled their appointment scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()}`;
          break;
      }
      
      const notification = {
        id: `notif_${Date.now()}`,
        appointmentId: appointment.id,
        recipientRole: 'doctor',
        recipientId: appointment.doctorId,
        type: type,
        title: title,
        body: body,
        read: false,
        timestamp: new Date().toISOString(),
      };
      
      notifications.push(notification);
      await AsyncStorage.setItem(APPOINTMENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
      
      console.log('📧 Notification sent to doctor:', title);
    } catch (error) {
      console.error('Error sending notification to doctor:', error);
    }
  }

  /**
   * Send notification to patient
   */
  async sendNotificationToPatient(appointment, type, oldStatus = null) {
    try {
      const notifications = await this.getStoredNotifications();
      
      let title = '';
      let body = '';
      
      switch (type) {
        case 'status_change':
          const statusMessages = {
            [APPOINTMENT_STATUS.CONFIRMED]: 'confirmed',
            [APPOINTMENT_STATUS.CANCELLED]: 'cancelled',
            [APPOINTMENT_STATUS.COMPLETED]: 'marked as completed',
          };
          title = 'Appointment Status Update';
          body = `Your appointment with ${appointment.doctorName} has been ${statusMessages[appointment.status] || appointment.status}`;
          break;
        case 'reschedule':
          title = 'Appointment Rescheduled';
          body = `Your appointment with ${appointment.doctorName} has been rescheduled to ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.appointmentTime}`;
          break;
        case 'cancellation':
          title = 'Appointment Cancelled';
          body = `Your appointment with ${appointment.doctorName} scheduled for ${new Date(appointment.appointmentDate).toLocaleDateString()} has been cancelled`;
          break;
      }
      
      const notification = {
        id: `notif_${Date.now()}`,
        appointmentId: appointment.id,
        recipientRole: 'patient',
        recipientId: appointment.patientId,
        type: type,
        title: title,
        body: body,
        read: false,
        timestamp: new Date().toISOString(),
      };
      
      notifications.push(notification);
      await AsyncStorage.setItem(APPOINTMENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
      
      console.log('📧 Notification sent to patient:', title);
    } catch (error) {
      console.error('Error sending notification to patient:', error);
    }
  }

  /**
   * Get stored notifications
   */
  async getStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem(APPOINTMENT_NOTIFICATIONS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  /**
   * Get notifications for current user
   */
  async getMyNotifications() {
    try {
      const allNotifications = await this.getStoredNotifications();
      
      if (this.currentUserRole === 'doctor') {
        return allNotifications.filter(notif => notif.recipientRole === 'doctor' && notif.recipientId === this.currentUser?.id);
      } else {
        return allNotifications.filter(notif => 
          notif.recipientRole === 'patient' && 
          (notif.recipientId === this.currentUser?.id || notif.recipientId === 'patient_sageikot')
        );
      }
    } catch (error) {
      console.error('Error getting my notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    try {
      const notifications = await this.getStoredNotifications();
      const notificationIndex = notifications.findIndex(notif => notif.id === notificationId);
      
      if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        await AsyncStorage.setItem(APPOINTMENT_NOTIFICATIONS_KEY, JSON.stringify(notifications));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Add listener for appointment changes
   */
  addListener(callback) {
    this.listeners.push(callback);
  }

  /**
   * Remove listener
   */
  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in appointment listener:', error);
      }
    });
  }

  /**
   * Debug method to log all appointments in storage
   */
  async debugStorage() {
    try {
      const allAppointments = await this.getAllAppointments();
      console.log('🔍 DEBUG: All appointments in storage:', {
        totalCount: allAppointments.length,
        appointments: allAppointments.map(apt => ({
          id: apt.id,
          doctorId: apt.doctorId,
          patientName: apt.patientName,
          appointmentDate: apt.appointmentDate,
          appointmentTime: apt.appointmentTime,
          status: apt.status
        }))
      });
      return allAppointments;
    } catch (error) {
      console.error('Error debugging storage:', error);
      return [];
    }
  }

  /**
   * Clear all data (for testing)
   */
  async clearAllData() {
    try {
      await AsyncStorage.removeItem(APPOINTMENTS_KEY);
      await AsyncStorage.removeItem(APPOINTMENT_NOTIFICATIONS_KEY);
      console.log('✅ All appointment data cleared');
    } catch (error) {
      console.error('Error clearing appointment data:', error);
    }
  }
}

export default new AppointmentService(); 