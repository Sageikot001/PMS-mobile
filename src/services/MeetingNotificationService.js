// MeetingNotificationService.js - Service to handle Google Meet notifications and participant tracking
import { Linking } from 'react-native';
import notificationService from './NotificationService';

class MeetingNotificationService {
  constructor() {
    this.activeMeetings = new Map(); // Store active meeting data
    this.participantStatus = new Map(); // Track who has joined meetings
  }

  // Register a new meeting with notification setup
  registerMeeting(appointmentId, meetingUrl, doctorInfo, patientInfo) {
    const meetingData = {
      appointmentId,
      meetingUrl,
      doctor: doctorInfo,
      patient: patientInfo,
      createdAt: new Date().toISOString(),
      participants: {
        doctor: { joined: false, joinedAt: null },
        patient: { joined: false, joinedAt: null }
      }
    };

    this.activeMeetings.set(appointmentId, meetingData);
    console.log('🔔 Meeting registered:', appointmentId);
    
    return meetingData;
  }

  // Handle when someone joins the meeting
  async participantJoined(appointmentId, role) {
    const meeting = this.activeMeetings.get(appointmentId);
    if (!meeting) {
      console.warn('Meeting not found:', appointmentId);
      return;
    }

    // Update participant status
    meeting.participants[role].joined = true;
    meeting.participants[role].joinedAt = new Date().toISOString();

    console.log(`📱 ${role} joined meeting:`, appointmentId);

    // Check if other participant should be notified
    const otherRole = role === 'doctor' ? 'patient' : 'doctor';
    const otherParticipant = meeting.participants[otherRole];

    if (!otherParticipant.joined) {
      // Other participant hasn't joined yet, send waiting notification
      await this.sendWaitingNotification(meeting, role, otherRole);
    }

    // Update stored meeting data
    this.activeMeetings.set(appointmentId, meeting);
  }

  // Send notification that someone is waiting
  async sendWaitingNotification(meeting, joinedRole, targetRole) {
    try {
      const joinedPerson = joinedRole === 'doctor' ? meeting.doctor.name : meeting.patient.name;
      const targetPerson = targetRole === 'doctor' ? meeting.doctor.name : meeting.patient.name;

      let notificationData;

      if (targetRole === 'doctor') {
        notificationData = {
          id: `waiting-${meeting.appointmentId}-${Date.now()}`,
          title: '👤 Patient Waiting in Meeting',
          body: `${meeting.patient.name} has joined the Google Meet and is waiting for you.`,
          data: {
            type: 'meeting_waiting',
            appointmentId: meeting.appointmentId,
            meetingUrl: meeting.meetingUrl,
            role: 'doctor',
            waitingPerson: meeting.patient.name,
            action: 'join_meeting'
          }
        };
      } else {
        notificationData = {
          id: `waiting-${meeting.appointmentId}-${Date.now()}`,
          title: '👨‍⚕️ Doctor Waiting in Meeting',
          body: `${meeting.doctor.name} has joined the Google Meet and is waiting for you.`,
          data: {
            type: 'meeting_waiting',
            appointmentId: meeting.appointmentId,
            meetingUrl: meeting.meetingUrl,
            role: 'patient',
            waitingPerson: meeting.doctor.name,
            action: 'join_meeting'
          }
        };
      }

      // Send immediate notification
      await this.sendNotification(notificationData);
      
      console.log('🔔 Waiting notification sent:', notificationData);
      
    } catch (error) {
      console.error('Error sending waiting notification:', error);
    }
  }

  // Send meeting reminder notifications
  async scheduleMeetingReminders(appointmentId, appointmentDateTime, doctorInfo, patientInfo) {
    try {
      const meeting = this.activeMeetings.get(appointmentId);
      if (!meeting) {
        console.warn('Meeting not found for reminders:', appointmentId);
        return;
      }

      // Schedule 5-minute reminder for doctor
      const doctorReminder = {
        id: `reminder-doctor-${appointmentId}`,
        title: '🏥 Appointment Starting Soon',
        body: `Your consultation with ${patientInfo.name} starts in 5 minutes. Tap to join Google Meet.`,
        data: {
          type: 'meeting_reminder',
          appointmentId: appointmentId,
          meetingUrl: meeting.meetingUrl,
          role: 'doctor',
          action: 'join_meeting'
        },
        scheduledTime: new Date(appointmentDateTime.getTime() - 5 * 60 * 1000)
      };

      // Schedule 5-minute reminder for patient
      const patientReminder = {
        id: `reminder-patient-${appointmentId}`,
        title: '🏥 Appointment Starting Soon',
        body: `Your consultation with ${doctorInfo.name} starts in 5 minutes. Tap to join Google Meet.`,
        data: {
          type: 'meeting_reminder',
          appointmentId: appointmentId,
          meetingUrl: meeting.meetingUrl,
          role: 'patient',
          action: 'join_meeting'
        },
        scheduledTime: new Date(appointmentDateTime.getTime() - 5 * 60 * 1000)
      };

      // In a real app, schedule these with the notification service
      console.log('🔔 Scheduled doctor reminder:', doctorReminder);
      console.log('🔔 Scheduled patient reminder:', patientReminder);

      return { doctorReminder, patientReminder };
    } catch (error) {
      console.error('Error scheduling meeting reminders:', error);
      throw error;
    }
  }

  // Handle notification tap/click
  async handleNotificationTap(notificationData) {
    try {
      const { type, meetingUrl, appointmentId, role, action } = notificationData;

      if (action === 'join_meeting' && meetingUrl) {
        // Direct redirect to Google Meet
        const supported = await Linking.canOpenURL(meetingUrl);
        if (supported) {
          await Linking.openURL(meetingUrl);
          
          // Mark participant as joined
          await this.participantJoined(appointmentId, role);
          
          console.log('🔗 Redirected to meeting via notification:', meetingUrl);
        } else {
          console.error('Cannot open meeting URL:', meetingUrl);
        }
      }
    } catch (error) {
      console.error('Error handling notification tap:', error);
    }
  }

  // Send a notification
  async sendNotification(notificationData) {
    try {
      // In a real app, this would use push notification service
      // For now, we'll simulate immediate notification
      console.log('🔔 Notification sent:', notificationData);
      
      // You could integrate with expo-notifications here
      // await Notifications.scheduleNotificationAsync({
      //   content: {
      //     title: notificationData.title,
      //     body: notificationData.body,
      //     data: notificationData.data
      //   },
      //   trigger: null // immediate
      // });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Get meeting status
  getMeetingStatus(appointmentId) {
    return this.activeMeetings.get(appointmentId);
  }

  // Clean up completed meetings
  completeMeeting(appointmentId) {
    const meeting = this.activeMeetings.get(appointmentId);
    if (meeting) {
      meeting.completedAt = new Date().toISOString();
      console.log('✅ Meeting completed:', appointmentId);
    }
    return meeting;
  }

  // Remove meeting from active tracking
  removeMeeting(appointmentId) {
    const removed = this.activeMeetings.delete(appointmentId);
    console.log('🗑️ Meeting removed from tracking:', appointmentId, removed);
    return removed;
  }

  // Get all active meetings
  getActiveMeetings() {
    return Array.from(this.activeMeetings.values());
  }
}

// Create and export singleton instance
const meetingNotificationService = new MeetingNotificationService();
export default meetingNotificationService; 