import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import BackendService from './BackendService';

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
 * Now integrates with MongoDB backend for data persistence
 */
class AppointmentService {
  constructor() {
    this.listeners = [];
    this.currentUser = null;
    this.currentUserRole = null; // 'patient' or 'doctor'
    this.useBackend = true; // Flag to control backend vs local storage
    this.backendAvailable = false; // Track backend availability
  }

  /**
   * Initialize the service with current user data
   */
  async initialize(user, role) {
    this.currentUser = user;
    this.currentUserRole = role;
    
    // Set user in backend service
    BackendService.setCurrentUser(user);
    
    // Test backend connectivity
    try {
      this.backendAvailable = await BackendService.testConnection();
      console.log('🌐 Backend availability:', this.backendAvailable);
    } catch (error) {
      console.log('🌐 Backend not available, using local storage:', error.message);
      this.backendAvailable = false;
    }
    
    await this.loadInitialData();
  }

  /**
   * Load initial appointment data
   */
  async loadInitialData() {
    try {
      console.log('📅 Loading initial appointment data...');
      
      // Check if appointments already exist
      const existingAppointments = await this.getAllAppointments();
      console.log('📅 Found existing appointments:', existingAppointments.length);
      
      if (existingAppointments.length === 0) {
        // Only initialize with demo data if no appointments exist
        console.log('📅 No existing appointments found, initializing demo data...');
        await this.initializeDemoData();
        console.log('📅 Initialized with demo appointment data');
      } else {
        console.log('📅 Found existing appointments, skipping demo data initialization');
        // Verify data integrity
        const validAppointments = existingAppointments.filter(apt => 
          apt.id && apt.appointmentDate && apt.appointmentTime
        );
        if (validAppointments.length !== existingAppointments.length) {
          console.warn('📅 Found invalid appointments, reinitializing...');
          await this.initializeDemoData();
        }
      }
    } catch (error) {
      console.error('Error loading appointment data:', error);
      // If there's an error, try to reinitialize
      try {
        await this.initializeDemoData();
        console.log('📅 Reinitialized appointment data after error');
      } catch (reinitError) {
        console.error('Failed to reinitialize appointment data:', reinitError);
      }
    }
  }

  /**
   * Initialize with demo appointment data
   */
  async initializeDemoData() {
    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayString = this.getDateString(today);
    
    // Get tomorrow's date in YYYY-MM-DD format
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowString = this.getDateString(tomorrow);
    
    // Get day after tomorrow in YYYY-MM-DD format
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    const dayAfterTomorrowString = this.getDateString(dayAfterTomorrow);
    
    console.log('📅 Creating demo appointments with dates:', {
      today: todayString,
      tomorrow: tomorrowString,
      dayAfterTomorrow: dayAfterTomorrowString
    });
    
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
        appointmentDate: dayAfterTomorrowString, // Use YYYY-MM-DD format
        appointmentTime: '10:00 AM',
        duration: 30,
        type: APPOINTMENT_TYPES.CONSULTATION,
        status: APPOINTMENT_STATUS.PENDING,
        reason: 'Regular cardiac checkup',
        notes: 'Patient requesting routine cardiology consultation',
        bookingDate: todayString,
        lastModified: todayString,
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
        appointmentDate: todayString, // Use YYYY-MM-DD format
        appointmentTime: '09:00 AM',
        duration: 30,
        type: APPOINTMENT_TYPES.FOLLOW_UP,
        status: APPOINTMENT_STATUS.PENDING,
        reason: 'Follow-up appointment for blood pressure monitoring',
        notes: 'Patient requesting follow-up consultation for hypertension management',
        bookingDate: todayString,
        lastModified: todayString,
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
        appointmentDate: tomorrowString, // Use YYYY-MM-DD format
        appointmentTime: '02:00 PM',
        duration: 45,
        type: APPOINTMENT_TYPES.CONSULTATION,
        status: APPOINTMENT_STATUS.PENDING,
        reason: 'New patient consultation',
        notes: 'New patient with chest pain and shortness of breath',
        bookingDate: todayString,
        lastModified: todayString,
        modifiedBy: 'patient_samuel',
        notifications: {
          reminderSent: false,
          statusChangeSent: false,
        },
      },
    ];

    await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(demoAppointments));
    console.log('📅 Demo appointments initialized with proper date format');
  }

  /**
   * Create a new appointment (Patient booking)
   */
  async createAppointment(appointmentData) {
    try {
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

      let createdAppointment;

      if (this.useBackend && this.backendAvailable) {
        // Use backend service
        createdAppointment = await BackendService.createAppointment(newAppointment);
        console.log('📅 Appointment created via backend:', createdAppointment.id);
      } else {
        // Use local storage
        const appointments = await this.getAllAppointments();
        appointments.push(newAppointment);
        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
        createdAppointment = newAppointment;
        console.log('📅 Appointment saved to local storage. Total appointments:', appointments.length);
      }
      
      // Notify listeners
      this.notifyListeners('appointment_created', createdAppointment);
      console.log('📅 Appointment created event sent to listeners');
      
      // Send notification to doctor
      await this.sendNotificationToDoctor(createdAppointment, 'new_appointment');
      
      return createdAppointment;
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
      console.log('📅 Rescheduling appointment:', { appointmentId, newDate, newTime, reason });
      
      // Ensure newDate is in YYYY-MM-DD format for consistency
      let formattedNewDate = newDate;
      if (newDate.includes('T') || newDate.includes('Z')) {
        // If it's an ISO string, convert to YYYY-MM-DD
        const dateObj = new Date(newDate);
        formattedNewDate = this.getDateString(dateObj);
      }
      
      console.log('📅 Date conversion:', { 
        originalNewDate: newDate, 
        formattedNewDate: formattedNewDate,
        newTime: newTime
      });
      
      let updatedAppointment;

      if (this.useBackend && this.backendAvailable) {
        // Use backend service
        updatedAppointment = await BackendService.rescheduleAppointment(
          appointmentId, 
          formattedNewDate, 
          newTime, 
          reason
        );
        console.log('📅 Appointment rescheduled via backend:', updatedAppointment.id);
      } else {
        // Use local storage
        const appointments = await this.getAllAppointments();
        const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
        
        if (appointmentIndex === -1) {
          throw new Error('Appointment not found');
        }

        const appointment = appointments[appointmentIndex];
        const oldDate = appointment.appointmentDate;
        const oldTime = appointment.appointmentTime;
        
        // Update appointment with new date/time and set status to 'confirmed' (doctor reschedule is automatic approval)
        appointments[appointmentIndex] = {
          ...appointment,
          appointmentDate: formattedNewDate,
          appointmentTime: newTime,
          status: APPOINTMENT_STATUS.CONFIRMED, // Changed from RESCHEDULED to CONFIRMED
          lastModified: new Date().toISOString(),
          modifiedBy: this.currentUser?.id || appointment.doctorId,
          rescheduleReason: reason,
          rescheduleInfo: {
            rescheduledBy: 'doctor',
            rescheduledAt: new Date().toISOString(),
            oldDate: oldDate,
            oldTime: oldTime,
            newDate: formattedNewDate,
            newTime: newTime,
            reason: reason,
            approved: true,
            approvedAt: new Date().toISOString()
          },
          changeHistory: [
            ...(appointment.changeHistory || []),
            {
              action: 'rescheduled_by_doctor',
              timestamp: new Date().toISOString(),
              by: this.currentUser?.id || appointment.doctorId,
              role: 'doctor',
              oldDate: oldDate,
              oldTime: oldTime,
              newDate: formattedNewDate,
              newTime: newTime,
              reason: reason,
              autoApproved: true
            }
          ],
        };

        await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
        updatedAppointment = appointments[appointmentIndex];
        
        console.log('📅 Appointment rescheduled and confirmed in local storage:', {
          id: updatedAppointment.id,
          newDate: formattedNewDate,
          newTime: newTime,
          status: updatedAppointment.status
        });
      }
      
      // Notify listeners with specific reschedule event
      this.notifyListeners('appointment_rescheduled', updatedAppointment);
      this.notifyListeners('appointment_updated', updatedAppointment);
      
      // Send notification to patient
      await this.sendNotificationToPatient(updatedAppointment, 'reschedule');
      
      return updatedAppointment;
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
   * Create a reschedule request (Patient action)
   */
  async createRescheduleRequest(appointmentId, newDate, newTime, reason = '') {
    try {
      const appointments = await this.getAllAppointments();
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      const appointment = appointments[appointmentIndex];
      const oldDate = appointment.appointmentDate;
      const oldTime = appointment.appointmentTime;
      
      // Create reschedule request
      const rescheduleRequest = {
        requestedDate: newDate,
        requestedTime: newTime,
        reason: reason,
        requestedBy: this.currentUserRole,
        requestedByUserId: this.currentUser?.id,
        status: 'pending',
        requestedAt: new Date().toISOString(),
      };

      appointments[appointmentIndex] = {
        ...appointment,
        status: 'reschedule_requested',
        rescheduleRequest: rescheduleRequest,
        lastModified: new Date().toISOString(),
        modifiedBy: this.currentUser?.id || appointment.patientId,
        changeHistory: [
          ...(appointment.changeHistory || []),
          {
            action: 'reschedule_requested',
            timestamp: new Date().toISOString(),
            by: this.currentUser?.id || appointment.patientId,
            role: this.currentUserRole,
            oldDate: oldDate,
            oldTime: oldTime,
            newDate: newDate,
            newTime: newTime,
            reason: reason,
          }
        ],
      };

      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      
      console.log('📅 Reschedule request created:', {
        appointmentId,
        requestedDate: newDate,
        requestedTime: newTime,
        reason: reason,
        status: 'pending'
      });
      
      // Notify listeners
      this.notifyListeners('reschedule_requested', appointments[appointmentIndex]);
      
      // Send notification to doctor
      await this.sendNotificationToDoctor(appointments[appointmentIndex], 'reschedule_request');
      
      return appointments[appointmentIndex];
    } catch (error) {
      console.error('Error creating reschedule request:', error);
      throw error;
    }
  }

  /**
   * Approve or reject reschedule request (Doctor action)
   */
  async handleRescheduleRequest(appointmentId, approved, doctorNotes = '') {
    try {
      const appointments = await this.getAllAppointments();
      const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
      
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }

      const appointment = appointments[appointmentIndex];
      
      if (!appointment.rescheduleRequest) {
        throw new Error('No reschedule request found for this appointment');
      }

      if (approved) {
        // Approve the reschedule request
        appointments[appointmentIndex] = {
          ...appointment,
          appointmentDate: appointment.rescheduleRequest.requestedDate,
          appointmentTime: appointment.rescheduleRequest.requestedTime,
          status: 'rescheduled',
          rescheduleRequest: {
            ...appointment.rescheduleRequest,
            status: 'approved',
            approvedAt: new Date().toISOString(),
            approvedBy: this.currentUser?.id,
            doctorNotes: doctorNotes,
          },
          lastModified: new Date().toISOString(),
          modifiedBy: this.currentUser?.id,
          changeHistory: [
            ...(appointment.changeHistory || []),
            {
              action: 'reschedule_approved',
              timestamp: new Date().toISOString(),
              by: this.currentUser?.id,
              role: 'doctor',
              newDate: appointment.rescheduleRequest.requestedDate,
              newTime: appointment.rescheduleRequest.requestedTime,
              notes: doctorNotes,
            }
          ],
        };
      } else {
        // Reject the reschedule request
        appointments[appointmentIndex] = {
          ...appointment,
          status: appointment.rescheduleRequest.oldStatus || 'confirmed',
          rescheduleRequest: {
            ...appointment.rescheduleRequest,
            status: 'rejected',
            rejectedAt: new Date().toISOString(),
            rejectedBy: this.currentUser?.id,
            doctorNotes: doctorNotes,
          },
          lastModified: new Date().toISOString(),
          modifiedBy: this.currentUser?.id,
          changeHistory: [
            ...(appointment.changeHistory || []),
            {
              action: 'reschedule_rejected',
              timestamp: new Date().toISOString(),
              by: this.currentUser?.id,
              role: 'doctor',
              notes: doctorNotes,
            }
          ],
        };
      }

      await AsyncStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
      
      console.log('📅 Reschedule request handled:', {
        appointmentId,
        approved,
        doctorNotes
      });
      
      // Notify listeners
      this.notifyListeners('reschedule_handled', appointments[appointmentIndex]);
      
      // Send notification to patient
      await this.sendNotificationToPatient(appointments[appointmentIndex], 'reschedule_response');
      
      return appointments[appointmentIndex];
    } catch (error) {
      console.error('Error handling reschedule request:', error);
      throw error;
    }
  }

  /**
   * Get all appointments
   */
  async getAllAppointments() {
    try {
      if (this.useBackend && this.backendAvailable) {
        return await BackendService.getAppointments();
      } else {
        const stored = await AsyncStorage.getItem(APPOINTMENTS_KEY);
        return stored ? JSON.parse(stored) : [];
      }
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
   * Debug method to validate date parsing
   */
  debugDateParsing(dateString, timeString) {
    try {
      console.log('🔍 DEBUG: Date parsing:', { dateString, timeString });
      
      // Parse date (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      console.log('🔍 DEBUG: Parsed date components:', { year, month, day });
      
      // Parse time (HH:MM)
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
      console.log('🔍 DEBUG: Parsed time components:', { hours, minutes });
      
      // Create date object
      const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
      console.log('🔍 DEBUG: Created date object:', {
        date: date.toISOString(),
        isValid: !isNaN(date.getTime()),
        timestamp: date.getTime()
      });
      
      return date;
    } catch (error) {
      console.error('🔍 DEBUG: Date parsing error:', error);
      return null;
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

  /**
   * Clear all data and reinitialize (for testing/fixing issues)
   */
  async clearAndReinitialize() {
    try {
      console.log('📅 Clearing all appointment data and reinitializing...');
      
      // Clear all storage
      await AsyncStorage.removeItem(APPOINTMENTS_KEY);
      await AsyncStorage.removeItem(APPOINTMENT_NOTIFICATIONS_KEY);
      
      // Clear listeners
      this.listeners = [];
      
      // Reinitialize with demo data
      await this.initializeDemoData();
      
      console.log('✅ All data cleared and reinitialized successfully');
      return true;
    } catch (error) {
      console.error('Error clearing and reinitializing data:', error);
      return false;
    }
  }

  /**
   * Utility method to format date consistently across the app
   */
  formatDateForDisplay(dateString) {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  /**
   * Utility method to get date in YYYY-MM-DD format
   */
  getDateString(date) {
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return null;
      }
      // Use local date to avoid timezone issues
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error getting date string:', error);
      return null;
    }
  }

  /**
   * Utility method to check if two dates are the same day
   */
  isSameDay(date1, date2) {
    try {
      const d1 = new Date(date1);
      const d2 = new Date(date2);
      
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return false;
      }
      
      // Compare local dates to avoid timezone issues
      return d1.getFullYear() === d2.getFullYear() &&
             d1.getMonth() === d2.getMonth() &&
             d1.getDate() === d2.getDate();
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  }

  /**
   * Utility method to create a date from date string and time string
   */
  createDateTimeFromStrings(dateString, timeString) {
    try {
      // Parse date (YYYY-MM-DD)
      const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
      
      // Parse time (HH:MM or HH:MM AM/PM)
      let hours, minutes;
      
      if (timeString.includes('AM') || timeString.includes('PM')) {
        // 12-hour format
        const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (!timeMatch) {
          throw new Error('Invalid time format');
        }
        [, hours, minutes, period] = timeMatch;
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        
        // Convert to 24-hour format
        if (period.toUpperCase() === 'PM' && hours !== 12) {
          hours += 12;
        } else if (period.toUpperCase() === 'AM' && hours === 12) {
          hours = 0;
        }
      } else {
        // 24-hour format
        [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
      }
      
      // Create date object (month is 0-indexed)
      const date = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date created');
      }
      
      return date;
    } catch (error) {
      console.error('Error creating date from strings:', error);
      return null;
    }
  }

  /**
   * Test function to verify appointment synchronization
   */
  async testAppointmentSync(appointmentId) {
    try {
      const appointment = await this.getAppointmentById(appointmentId);
      if (!appointment) {
        console.log('❌ Appointment not found for sync test');
        return false;
      }
      
      console.log('🔍 Testing appointment synchronization:');
      console.log('  - Appointment ID:', appointment.id);
      console.log('  - Patient:', appointment.patientName);
      console.log('  - Doctor:', appointment.doctorName);
      console.log('  - Date:', appointment.appointmentDate);
      console.log('  - Time:', appointment.appointmentTime);
      console.log('  - Status:', appointment.status);
      console.log('  - Last Modified:', appointment.lastModified);
      console.log('  - Modified By:', appointment.modifiedBy);
      
      // Test date format consistency
      const dateString = this.getDateString(appointment.appointmentDate);
      console.log('  - Date String Consistency:', dateString);
      
      // Test date parsing for notifications
      if (appointment.appointmentDate && appointment.appointmentTime) {
        try {
          const parsedDate = this.createDateTimeFromStrings(appointment.appointmentDate, appointment.appointmentTime);
          console.log('  - Date/Time Parsing:', parsedDate ? '✅ Success' : '❌ Failed');
        } catch (error) {
          console.log('  - Date/Time Parsing:', '❌ Failed -', error.message);
        }
      }
      
      // Test status validity
      const validStatuses = ['pending', 'confirmed', 'scheduled', 'cancelled', 'completed', 'rescheduled', 'reschedule_requested'];
      const statusValid = validStatuses.includes(appointment.status);
      console.log('  - Status Validity:', statusValid ? '✅ Valid' : '❌ Invalid');
      
      // Test reschedule info if present
      if (appointment.rescheduleInfo) {
        console.log('  - Reschedule Info Present:', '✅ Yes');
        console.log('    - Rescheduled By:', appointment.rescheduleInfo.rescheduledBy);
        console.log('    - New Date:', appointment.rescheduleInfo.newDate);
        console.log('    - New Time:', appointment.rescheduleInfo.newTime);
        console.log('    - Approved:', appointment.rescheduleInfo.approved);
      } else {
        console.log('  - Reschedule Info Present:', '❌ No');
      }
      
      return true;
    } catch (error) {
      console.error('Error testing appointment sync:', error);
      return false;
    }
  }

  /**
   * Test comprehensive synchronization between patient and doctor data
   */
  async testComprehensiveSync() {
    try {
      console.log('🔍 COMPREHENSIVE APPOINTMENT SYNC TEST');
      console.log('=====================================');
      
      const allAppointments = await this.getAllAppointments();
      console.log('📊 Total appointments in storage:', allAppointments.length);
      
      for (const appointment of allAppointments) {
        console.log(`\n📋 Testing appointment: ${appointment.id}`);
        await this.testAppointmentSync(appointment.id);
      }
      
      console.log('\n✅ Comprehensive sync test completed');
      return true;
    } catch (error) {
      console.error('Error in comprehensive sync test:', error);
      return false;
    }
  }
}

export default new AppointmentService(); 