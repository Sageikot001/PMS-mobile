import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.scheduledNotifications = new Map();
    this.sentNotifications = new Set(); // Track sent notifications to prevent duplicates
    this.notificationQueue = [];
    this.isServiceRunning = false;
  }

  // Initialize the notification service
  async initialize() {
    try {
      // Load any previously scheduled notifications
      const savedNotifications = await AsyncStorage.getItem('scheduledNotifications');
      if (savedNotifications) {
        const notifications = JSON.parse(savedNotifications);
        this.scheduledNotifications = new Map(notifications);
      }
      
      // Load sent notifications tracking
      const sentNotifications = await AsyncStorage.getItem('sentNotifications');
      if (sentNotifications) {
        this.sentNotifications = new Set(JSON.parse(sentNotifications));
      }
      
      this.isServiceRunning = true;
      this.startNotificationChecker();
      console.log('Notification Service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Helper function to parse appointment date and time
  parseAppointmentDateTime(dateStr, timeStr) {
    try {
      // Check if dateStr and timeStr are valid
      if (!dateStr || !timeStr || typeof dateStr !== 'string' || typeof timeStr !== 'string') {
        throw new Error('Invalid date or time parameters');
      }

      // Parse date (format: YYYY-MM-DD)
      const [year, month, day] = dateStr.split('-').map(Number);
      
      // Parse time (format: HH:MM AM/PM)
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error('Invalid time format');
      }
      
      let [, hours, minutes, period] = timeMatch;
      hours = parseInt(hours);
      minutes = parseInt(minutes);
      
      // Convert to 24-hour format
      if (period.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      // Create date object (month is 0-indexed in JavaScript)
      const appointmentDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      
      // Validate the date
      if (isNaN(appointmentDate.getTime())) {
        throw new Error('Invalid date created');
      }
      
      return appointmentDate;
    } catch (error) {
      console.error('Error parsing appointment date/time:', { dateStr, timeStr, error });
      return null;
    }
  }

  // Schedule an appointment reminder notification
  scheduleAppointmentReminder(appointment, reminderMinutes = 30) {
    try {
      // Validate appointment data with detailed logging
      if (!appointment) {
        console.error('scheduleAppointmentReminder: appointment is null/undefined');
        return null;
      }

      if (!appointment.date) {
        console.error('scheduleAppointmentReminder: appointment.date is missing', appointment);
        return null;
      }

      // Use appointmentTime instead of time to match our data structure
      if (!appointment.appointmentTime) {
        console.error('scheduleAppointmentReminder: appointment.appointmentTime is missing', appointment);
        return null;
      }

      if (!appointment.id) {
        console.error('scheduleAppointmentReminder: appointment.id is missing', appointment);
        return null;
      }

      // Use patientName instead of patient to match our data structure
      if (!appointment.patientName) {
        console.error('scheduleAppointmentReminder: appointment.patientName is missing', appointment);
        return null;
      }

      console.log('Scheduling reminder for appointment:', {
        id: appointment.id,
        date: appointment.date,
        appointmentTime: appointment.appointmentTime,
        patientName: appointment.patientName,
        reminderMinutes
      });

      const appointmentTime = this.parseAppointmentDateTime(appointment.date, appointment.appointmentTime);
      
      if (!appointmentTime) {
        console.error('Failed to parse appointment time for:', appointment.date, appointment.appointmentTime);
        return null;
      }
      
      const reminderTime = new Date(appointmentTime.getTime() - (reminderMinutes * 60 * 1000));
      
      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) {
        console.log('Reminder time is in the past, skipping notification for:', appointment.id, reminderTime.toLocaleString());
        return null;
      }

      const notificationId = `appointment_${appointment.id}_${reminderMinutes}min`;
      
      // Check if this notification has already been sent
      if (this.sentNotifications.has(notificationId)) {
        console.log(`Notification ${notificationId} already sent, skipping`);
        return null;
      }

      const notification = {
        id: notificationId,
        appointmentId: appointment.id,
        type: 'appointment_reminder',
        title: `Appointment in ${reminderMinutes} minutes`,
        message: `You have an appointment with ${appointment.patientName} in ${reminderMinutes} minutes`,
        scheduledTime: reminderTime.toISOString(),
        appointmentData: appointment,
        reminderMinutes
      };

      this.scheduledNotifications.set(notificationId, notification);
      this.saveNotifications();
      
      console.log(`✅ Scheduled reminder for appointment ${appointment.id} at ${reminderTime.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling appointment reminder:', error, appointment);
      return null;
    }
  }

  // Schedule multiple reminders for appointments
  scheduleAppointmentReminders(appointments, reminderTimes = [30, 15, 5]) {
    const scheduledIds = [];
    
    appointments.forEach(appointment => {
      reminderTimes.forEach(minutes => {
        const id = this.scheduleAppointmentReminder(appointment, minutes);
        if (id) {
          scheduledIds.push(id);
        }
      });
    });
    
    return scheduledIds;
  }

  // Schedule reminders for all today's appointments
  scheduleAllTodaysReminders(todaysAppointments) {
    console.log(`Scheduling reminders for ${todaysAppointments.length} appointments today`);
    
    todaysAppointments.forEach(appointment => {
      // Schedule 30, 15, and 5 minute reminders for each appointment
      [30, 15, 5].forEach(minutes => {
        this.scheduleAppointmentReminder(appointment, minutes);
      });
    });
    
    this.saveNotifications();
  }

  // Cancel a scheduled notification
  cancelNotification(notificationId) {
    if (this.scheduledNotifications.has(notificationId)) {
      this.scheduledNotifications.delete(notificationId);
      this.saveNotifications();
      console.log(`Cancelled notification: ${notificationId}`);
      return true;
    }
    return false;
  }

  // Cancel all notifications for a specific appointment
  cancelAppointmentNotifications(appointmentId) {
    const toDelete = [];
    
    this.scheduledNotifications.forEach((notification, key) => {
      if (notification.appointmentId === appointmentId) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => {
      this.scheduledNotifications.delete(key);
    });
    
    if (toDelete.length > 0) {
      this.saveNotifications();
      console.log(`Cancelled ${toDelete.length} notifications for appointment ${appointmentId}`);
    }
    
    return toDelete.length;
  }

  // Show immediate notification
  showNotification(title, message, type = 'info', onPress = null) {
    const notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      onPress
    };

    // For now, use Alert - in production you'd use a proper notification library
    Alert.alert(
      title,
      message,
      [
        {
          text: 'OK',
          onPress: onPress || (() => {})
        }
      ]
    );

    // Add to notification history
    this.addToNotificationHistory(notification);
  }

  // Start the notification checker (runs every minute)
  startNotificationChecker() {
    if (!this.isServiceRunning) return;

    const checkInterval = setInterval(() => {
      this.checkForDueNotifications();
    }, 60000); // Check every minute

    // Store interval ID for cleanup
    this.checkInterval = checkInterval;
  }

  // Check for notifications that are due
  checkForDueNotifications() {
    const now = new Date();
    const dueNotifications = [];

    this.scheduledNotifications.forEach((notification, key) => {
      const scheduledTime = new Date(notification.scheduledTime);
      
      // Check if notification is due (within the last minute to current time)
      const timeDiff = now.getTime() - scheduledTime.getTime();
      
      // Notification is due if it's within the last minute and not already sent
      if (timeDiff >= 0 && timeDiff <= 60000 && !this.sentNotifications.has(notification.id)) {
        dueNotifications.push({ key, notification });
      }
    });

    // Process due notifications
    dueNotifications.forEach(({ key, notification }) => {
      this.triggerNotification(notification);
      this.sentNotifications.add(notification.id); // Mark as sent
      this.scheduledNotifications.delete(key); // Remove from scheduled
    });

    if (dueNotifications.length > 0) {
      this.saveNotifications();
      this.saveSentNotifications();
    }
  }

  // Trigger a notification
  triggerNotification(notification) {
    console.log('Triggering notification:', notification.title);
    
    const onPress = () => {
      // Navigate to appointment details or relevant screen
      if (notification.type === 'appointment_reminder') {
        console.log('Navigate to appointment:', notification.appointmentId);
      }
    };

    this.showNotification(
      notification.title,
      notification.message,
      notification.type,
      onPress
    );
  }

  // Add notification to history
  async addToNotificationHistory(notification) {
    try {
      const historyKey = 'notificationHistory';
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      history.unshift(notification);
      
      // Keep only last 50 notifications
      if (history.length > 50) {
        history.splice(50);
      }
      
      await AsyncStorage.setItem(historyKey, JSON.stringify(history));
    } catch (error) {
      console.error('Error saving notification to history:', error);
    }
  }

  // Get notification history
  async getNotificationHistory() {
    try {
      const history = await AsyncStorage.getItem('notificationHistory');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading notification history:', error);
      return [];
    }
  }

  // Save scheduled notifications to storage
  async saveNotifications() {
    try {
      const notificationsArray = Array.from(this.scheduledNotifications.entries());
      await AsyncStorage.setItem('scheduledNotifications', JSON.stringify(notificationsArray));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  }

  // Save sent notifications tracking
  async saveSentNotifications() {
    try {
      const sentArray = Array.from(this.sentNotifications);
      await AsyncStorage.setItem('sentNotifications', JSON.stringify(sentArray));
    } catch (error) {
      console.error('Error saving sent notifications:', error);
    }
  }

  // Get scheduled notifications as array
  async getScheduledNotifications() {
    try {
      // Convert Map to array and sort by scheduled time
      const notifications = Array.from(this.scheduledNotifications.values())
        .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
      
      return notifications;
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  // Clean up expired notifications and old sent notification tracking
  cleanupExpiredNotifications() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
    const toDelete = [];

    // Clean up old scheduled notifications
    this.scheduledNotifications.forEach((notification, key) => {
      const scheduledTime = new Date(notification.scheduledTime);
      // Remove notifications that are more than 1 hour overdue
      if (scheduledTime < new Date(now.getTime() - (60 * 60 * 1000))) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => {
      this.scheduledNotifications.delete(key);
    });

    // Clean up old sent notification tracking (older than 1 day)
    const sentToDelete = [];
    this.sentNotifications.forEach(notificationId => {
      // Extract timestamp from notification ID if possible, or clean up all old ones
      // For simplicity, we'll clean up sent notifications older than 1 day
      if (notificationId.includes('appointment_') && Math.random() > 0.9) {
        // Randomly clean up some old sent notifications to prevent infinite growth
        sentToDelete.push(notificationId);
      }
    });

    sentToDelete.forEach(id => {
      this.sentNotifications.delete(id);
    });

    if (toDelete.length > 0 || sentToDelete.length > 0) {
      this.saveNotifications();
      this.saveSentNotifications();
      console.log(`Cleaned up ${toDelete.length} expired notifications and ${sentToDelete.length} old sent notifications`);
    }
  }

  // Reset sent notifications for a new day
  async clearSentNotificationsForNewDay() {
    try {
      this.sentNotifications.clear();
      await AsyncStorage.removeItem('sentNotifications');
      console.log('Cleared sent notifications for new day');
    } catch (error) {
      console.error('Error clearing sent notifications:', error);
    }
  }

  // Stop the notification service
  stop() {
    this.isServiceRunning = false;
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    console.log('Notification Service stopped');
  }

  // Send chat notification
  showChatNotification(senderName, message, chatId) {
    const notification = this.createNotification(
      'chat',
      `New message from ${senderName}`,
      message,
      { chatId } // For navigation
    );

    this.showNotification(notification.title, notification.message, 'chat');
    this.addToNotificationHistory(notification);
  }

  // Send call notification
  showCallNotification(callerName, callType, chatId) {
    const notification = this.createNotification(
      'call',
      `Incoming ${callType} call`,
      `${callerName} is calling you`,
      { chatId } // For navigation
    );

    this.showNotification(notification.title, notification.message, 'call');
    this.addToNotificationHistory(notification);
  }

  // Show appointment ready notification with navigation data
  showAppointmentReadyNotification(appointment) {
    const notification = this.createNotification(
      'appointment_ready',
      'Patient is Waiting',
      `${appointment.patientName} is ready for their appointment`,
      { appointmentId: appointment.id } // For navigation
    );

    this.showNotification(notification.title, notification.message, 'appointment_ready');
    this.addToNotificationHistory(notification);
  }

  // Delete specific notifications from history
  async deleteNotifications(notificationIds) {
    try {
      const history = await this.getNotificationHistory();
      const filteredHistory = history.filter(notification => 
        !notificationIds.includes(notification.id)
      );
      
      await AsyncStorage.setItem('notificationHistory', JSON.stringify(filteredHistory));
      console.log(`Deleted ${notificationIds.length} notifications from history`);
      return true;
    } catch (error) {
      console.error('Error deleting notifications:', error);
      return false;
    }
  }

  // Clear notification history
  async clearNotificationHistory() {
    try {
      await AsyncStorage.removeItem('notificationHistory');
      console.log('Notification history cleared');
      return true;
    } catch (error) {
      console.error('Error clearing notification history:', error);
      return false;
    }
  }

  // Enhanced notification creation with navigation data
  createNotification(type, title, message, data = {}) {
    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      ...data // Include appointmentId, chatId, etc.
    };
  }

  // Get status of notification service for debugging
  getServiceStatus() {
    return {
      isServiceRunning: this.isServiceRunning,
      scheduledNotificationsCount: this.scheduledNotifications.size,
      sentNotificationsCount: this.sentNotifications.size,
      scheduledNotifications: Array.from(this.scheduledNotifications.values()).map(notification => ({
        id: notification.id,
        title: notification.title,
        scheduledTime: notification.scheduledTime,
        appointmentId: notification.appointmentId
      }))
    };
  }

  // Force check notifications (for debugging)
  forceCheckNotifications() {
    console.log('Forcing notification check...');
    this.checkForDueNotifications();
  }

  // Test method to verify appointment data structure compatibility
  testAppointmentDataStructure(appointment) {
    console.log('Testing appointment data structure:', {
      hasId: !!appointment.id,
      hasDate: !!appointment.date,
      hasAppointmentTime: !!appointment.appointmentTime,
      hasPatientName: !!appointment.patientName,
      appointmentData: appointment
    });

    const isValid = appointment.id && appointment.date && appointment.appointmentTime && appointment.patientName;
    
    if (isValid) {
      console.log('✅ Appointment data structure is valid');
      return true;
    } else {
      console.error('❌ Appointment data structure is invalid');
      return false;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 