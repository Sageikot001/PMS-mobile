import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

class NotificationService {
  constructor() {
    this.scheduledNotifications = new Map();
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
      // Validate appointment data
      if (!appointment || !appointment.date || !appointment.time) {
        console.error('Invalid appointment data, skipping notification');
        return null;
      }

      const appointmentTime = this.parseAppointmentDateTime(appointment.date, appointment.time);
      
      if (!appointmentTime) {
        console.error('Failed to parse appointment time, skipping notification');
        return null;
      }
      
      const reminderTime = new Date(appointmentTime.getTime() - (reminderMinutes * 60 * 1000));
      
      // Don't schedule if reminder time is in the past
      if (reminderTime <= new Date()) {
        console.log('Reminder time is in the past, skipping notification');
        return null;
      }

      const notificationId = `appointment_${appointment.id}_${reminderMinutes}min`;
      const notification = {
        id: notificationId,
        appointmentId: appointment.id,
        type: 'appointment_reminder',
        title: 'Upcoming Appointment',
        message: `You have an appointment with ${appointment.patient} in ${reminderMinutes} minutes`,
        scheduledTime: reminderTime.toISOString(),
        appointmentData: appointment,
        reminderMinutes
      };

      this.scheduledNotifications.set(notificationId, notification);
      this.saveNotifications();
      
      console.log(`Scheduled reminder for appointment ${appointment.id} at ${reminderTime.toLocaleString()}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling appointment reminder:', error);
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
      if (scheduledTime <= now) {
        dueNotifications.push({ key, notification });
      }
    });

    // Process due notifications
    dueNotifications.forEach(({ key, notification }) => {
      this.triggerNotification(notification);
      this.scheduledNotifications.delete(key);
    });

    if (dueNotifications.length > 0) {
      this.saveNotifications();
    }
  }

  // Trigger a notification
  triggerNotification(notification) {
    console.log('Triggering notification:', notification.title);
    
    const onPress = () => {
      // Navigate to appointment details or relevant screen
      if (notification.type === 'appointment_reminder') {
        // You can add navigation logic here
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

  // Get all scheduled notifications
  getScheduledNotifications() {
    return Array.from(this.scheduledNotifications.values());
  }

  // Clean up expired notifications
  cleanupExpiredNotifications() {
    const now = new Date();
    const toDelete = [];

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

    if (toDelete.length > 0) {
      this.saveNotifications();
      console.log(`Cleaned up ${toDelete.length} expired notifications`);
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
    this.showNotification(
      `New message from ${senderName}`,
      message.length > 50 ? message.substring(0, 50) + '...' : message,
      'chat',
      () => {
        // Navigate to chat screen
        console.log('Navigate to chat:', chatId);
      }
    );
  }

  // Send call notification
  showCallNotification(callerName, callType, callId) {
    const message = `Incoming ${callType} call`;
    this.showNotification(
      message,
      `${callerName} is calling you`,
      'call',
      () => {
        // Navigate to call screen or handle call
        console.log('Handle call:', callId);
      }
    );
  }

  // Clear notification history
  async clearNotificationHistory() {
    try {
      await AsyncStorage.removeItem('notificationHistory');
      console.log('Notification history cleared');
    } catch (error) {
      console.error('Error clearing notification history:', error);
      throw error;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService; 