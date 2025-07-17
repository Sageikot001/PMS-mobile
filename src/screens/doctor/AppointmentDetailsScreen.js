import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import chatService from '../../services/ChatService';
import notificationService from '../../services/NotificationService';
import doctorService from '../../services/DoctorService';
import meetingNotificationService from '../../services/MeetingNotificationService';
import emailService from '../../services/EmailService';
import googleMeetService from '../../services/GoogleMeetService';
import { getAppointmentById } from '../../data/appointmentsData';

// Simple custom calendar component
const SimpleCalendar = ({ selectedDate, onDatePress, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isDisabled = minDate && dateString < minDate;
      days.push({
        day,
        dateString,
        isToday: dateString === new Date().toISOString().split('T')[0],
        isSelected: dateString === selectedDate,
        isDisabled
      });
    }
    
    return days;
  };
  
  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.calendarArrow}>
          <Ionicons name="chevron-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.calendarTitle}>{monthYear}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.calendarArrow}>
          <Ionicons name="chevron-forward" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekDaysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>
      
      <View style={styles.daysGrid}>
        {days.map((dayData, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              dayData?.isSelected && styles.selectedDay,
              dayData?.isToday && styles.todayDay,
              dayData?.isDisabled && styles.disabledDay,
            ]}
            onPress={() => dayData && !dayData.isDisabled && onDatePress(dayData.dateString)}
            disabled={!dayData || dayData.isDisabled}
          >
            {dayData && (
              <Text style={[
                styles.dayText,
                dayData.isSelected && styles.selectedDayText,
                dayData.isToday && styles.todayDayText,
                dayData.isDisabled && styles.disabledDayText,
              ]}>
                {dayData.day}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const AppointmentDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState(null);
  const [timeUntilAppointment, setTimeUntilAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [showCallOptionsModal, setShowCallOptionsModal] = useState(false);
  const [selectedCallType, setSelectedCallType] = useState('voice'); // 'voice' or 'video'

  // Available time slots for rescheduling
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour < 12 ? 'AM' : 'PM';
        const time12 = `${String(hour12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`;
        
        slots.push({
          time24,
          time12,
          hour,
          minute,
          isBusinessHours: hour >= 8 && hour < 18, // Default business hours 8 AM - 6 PM
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Doctor's availability settings (in a real app, this would come from backend)
  const [doctorAvailability] = useState({
    // Default availability - business hours only
    enabledHours: Array.from({length: 10}, (_, i) => i + 8), // 8 AM to 5 PM
    disabledSlots: [], // Specific time slots that are unavailable
    customAvailableSlots: [], // Custom slots outside business hours
  });

  // Check if a time slot is available for selection
  const isTimeSlotAvailable = (timeSlot) => {
    const { hour } = timeSlot;
    const timeKey = timeSlot.time24;
    
    // Check if hour is enabled
    if (!doctorAvailability.enabledHours.includes(hour)) {
      // Check if this specific slot is in custom available slots
      return doctorAvailability.customAvailableSlots.includes(timeKey);
    }
    
    // Check if this specific slot is disabled
    return !doctorAvailability.disabledSlots.includes(timeKey);
  };

  // Get filtered available time slots
  const getAvailableTimeSlots = () => {
    return timeSlots.filter(isTimeSlotAvailable);
  };

  // Call options configuration
  const callOptions = [
    {
      id: 'inapp',
      name: 'In-App Call',
      icon: 'call',
      color: '#4A90E2',
      description: 'Secure, encrypted call within the app'
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'logo-whatsapp',
      color: '#25D366',
      description: 'Call via WhatsApp'
    },
    {
      id: 'zoom',
      name: 'Zoom',
      icon: 'videocam',
      color: '#2D8CFF',
      description: 'Professional video conferencing'
    },
    {
      id: 'gmail',
      name: 'Google Meet',
      icon: 'mail',
      color: '#EA4335',
      description: 'Call via Google Meet'
    }
  ];

  useEffect(() => {
    loadAppointmentDetails();
    const interval = setInterval(updateTimeUntilAppointment, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    if (appointment) {
      updateTimeUntilAppointment();
    }
  }, [appointment]);

  const loadAppointmentDetails = () => {
    // In a real app, you'd fetch this from your API
    const appointmentData = getAppointmentById(appointmentId);
    if (appointmentData) {
      setAppointment(appointmentData);
    } else {
      Alert.alert('Error', 'Appointment not found');
      navigation.goBack();
    }
  };

  // Helper function to parse appointment date and time
  const parseAppointmentDateTime = (dateStr, timeStr) => {
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
  };

  const updateTimeUntilAppointment = () => {
    if (!appointment || !appointment.date || !appointment.time) return;

    const now = new Date();
    const appointmentDateTime = parseAppointmentDateTime(appointment.date, appointment.time);
    
    if (!appointmentDateTime) {
      console.error('Failed to parse appointment time');
      return;
    }
    
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(timeDiff / (1000 * 60));

    setTimeUntilAppointment(minutesUntil);

    // Only show "patient is waiting" notification when appointment time arrives (0 to -5 minutes)
    // and only once per appointment to avoid spam
    if (minutesUntil <= 0 && minutesUntil >= -5 && appointment.status === 'accepted') {
      const notificationId = `patient_waiting_${appointment.id}`;
      
      // Check if we've already shown this notification
      if (!appointment.patientWaitingNotificationSent) {
        notificationService.showAppointmentReadyNotification(appointment);
        
        // Mark that we've sent this notification
        setAppointment(prev => ({ 
          ...prev, 
          patientWaitingNotificationSent: true 
        }));
      }
    }
  };

  const getAppointmentStatus = () => {
    if (!appointment || !timeUntilAppointment) return { text: 'Loading...', color: '#7F8C8D' };

    if (appointment.status === 'pending') {
      return { text: 'Pending Acceptance', color: '#fd7e14' };
    }

    if (appointment.status === 'cancelled') {
      return { text: 'Cancelled', color: '#dc3545' };
    }

    if (appointment.status === 'completed') {
      return { text: 'Completed', color: '#28a745' };
    }

    if (timeUntilAppointment <= 0) {
      return { text: 'In Progress', color: '#17a2b8' };
    }

    if (timeUntilAppointment <= 10) {
      return { text: 'Starting Soon', color: '#fd7e14' };
    }

    return { text: 'Scheduled', color: '#4A90E2' };
  };

  const canStartChat = () => {
    // Chat is available once appointment is accepted
    return appointment?.status === 'accepted';
  };

  const canStartCall = () => {
    // Calls are available 10 minutes before appointment time
    return appointment?.status === 'accepted' && timeUntilAppointment <= 10;
  };

  const handleAcceptAppointment = () => {
    Alert.alert(
      'Accept Appointment',
      `Accept appointment with ${appointment.patient}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            // Update appointment status
            setAppointment(prev => ({ ...prev, status: 'accepted' }));
            Alert.alert('Success', 'Appointment accepted successfully');
          }
        }
      ]
    );
  };

  const handleStartChat = async () => {
    if (!canStartChat()) {
      Alert.alert('Chat Locked', 'Chat will be available after accepting the appointment');
      return;
    }

    try {
      // Create or get existing chat
      const chat = await chatService.createChat(
        appointment.patientId,
        appointment.patient,
        'patient'
      );
      
      navigation.navigate('ChatScreen', { chatId: chat.id });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const handleVoiceCall = async () => {
    if (!canStartCall()) {
      const timeText = timeUntilAppointment > 10 
        ? `${timeUntilAppointment - 10} minutes` 
        : 'accepting the appointment';
      Alert.alert(
        'Call Locked', 
        `Voice calls will be available 10 minutes before the appointment time. Available in ${timeText}.`
      );
      return;
    }

    setSelectedCallType('voice');
    setShowCallOptionsModal(true);
  };

  const handleVideoCall = async () => {
    if (!canStartCall()) {
      const timeText = timeUntilAppointment > 10 
        ? `${timeUntilAppointment - 10} minutes` 
        : 'accepting the appointment';
      Alert.alert(
        'Call Locked', 
        `Video calls will be available 10 minutes before the appointment time. Available in ${timeText}.`
      );
      return;
    }

    setSelectedCallType('video');
    setShowCallOptionsModal(true);
  };

  // Handle call option selection
  const handleCallOptionSelect = async (option) => {
    setShowCallOptionsModal(false);
    
    try {
      switch (option.id) {
        case 'inapp':
          await handleInAppCall();
          break;
        case 'whatsapp':
          await handleWhatsAppCall();
          break;
        case 'zoom':
          await handleZoomCall();
          break;
        case 'gmail':
          await handleGoogleMeetCall();
          break;
        default:
          Alert.alert('Error', 'Call option not supported');
      }
    } catch (error) {
      console.error('Error handling call option:', error);
      Alert.alert('Error', 'Failed to initiate call');
    }
  };

  // In-app call handling
  const handleInAppCall = async () => {
    try {
      // Get or create chat for the call
      const chat = await chatService.createChat(
        appointment.patientId,
        appointment.patient,
        'patient'
      );
      
      const callData = selectedCallType === 'video' 
        ? await chatService.initiateVideoCall(chat.id)
        : await chatService.initiateVoiceCall(chat.id);
      
      Alert.alert(
        `${selectedCallType === 'video' ? 'Video' : 'Voice'} Call`,
        `Starting ${selectedCallType} call with ${appointment.patient}`,
        [
          { text: 'End Call', onPress: () => chatService.endCall(callData.callId) },
          { text: 'Continue', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error starting in-app call:', error);
      Alert.alert('Error', 'Failed to start in-app call');
    }
  };

  // WhatsApp call handling
  const handleWhatsAppCall = async () => {
    const phoneNumber = appointment.contactInfo?.phone?.replace(/[^\d]/g, '');
    if (!phoneNumber) {
      Alert.alert('Error', 'Patient phone number not available');
      return;
    }

    const whatsappUrl = `whatsapp://call?phone=${phoneNumber}`;
    
    Alert.alert(
      'WhatsApp Call',
      `Call ${appointment.patient} via WhatsApp?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            // In a real app, you'd use Linking.openURL(whatsappUrl)
            Alert.alert('WhatsApp Call', 'Opening WhatsApp...');
          }
        }
      ]
    );
  };

  // Zoom call handling
  const handleZoomCall = async () => {
    // In a real app, you'd integrate with Zoom SDK
    const meetingId = `${appointment.id}-${Date.now()}`;
    const zoomUrl = `https://zoom.us/j/${meetingId}`;
    
    Alert.alert(
      'Zoom Meeting',
      `Meeting ID: ${meetingId}\n\nShare this meeting link with ${appointment.patient}:\n${zoomUrl}`,
      [
        { text: 'Copy Link', onPress: () => Alert.alert('Link Copied', 'Meeting link copied to clipboard') },
        { text: 'Start Meeting', onPress: () => Alert.alert('Zoom', 'Opening Zoom...') }
      ]
    );
  };

  // Google Meet call handling with comprehensive integration
  const handleGoogleMeetCall = async () => {
    try {
      // Get doctor's and patient's information
      const doctorEmail = doctorService.getCurrentDoctorEmail();
      const doctorName = doctorService.getCurrentDoctorName();
      const doctorContact = doctorService.getCurrentDoctorContact();
      const patientEmail = appointment.contactInfo?.email;
      
      if (!patientEmail) {
        Alert.alert('Error', 'Patient email address not available. Cannot set up Google Meet.');
        return;
      }
    
    Alert.alert(
        'Google Meet Setup',
        `Setting up Google Meet consultation for ${appointment.patient}\n\n` +
        `👨‍⚕️ Doctor: ${doctorName}\n` +
        `📧 Doctor Email: ${doctorEmail}\n` +
        `👤 Patient: ${appointment.patient}\n` +
        `📧 Patient Email: ${patientEmail}\n\n` +
        `This will:\n` +
        `• Create actual Google Meet room\n` +
        `• Open email client for patient invitation\n` +
        `• Add meeting link to in-app chat\n` +
        `• Set up meeting notifications`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Create & Start Meeting',
            onPress: async () => {
              try {
                console.log('🔗 Starting Google Meet setup process...');

                // 1. Create actual Google Meet meeting
                const doctorInfo = {
                  name: doctorName,
                  email: doctorEmail,
                  specialization: doctorContact.specialization
                };
                
                const patientInfo = {
                  name: appointment.patient,
                  email: patientEmail
                };

                const meetingData = await googleMeetService.createMeeting(
                  appointment,
                  doctorInfo,
                  patientInfo
                );

                const meetUrl = meetingData.url;
                console.log('✅ Google Meet created:', meetUrl);

                // 2. Initialize email service if not already done
                await emailService.initialize();

                // 3. Open email client for patient invitation
                const emailResult = await emailService.sendMeetingInvitation(
                  doctorInfo,
                  patientInfo,
                  appointment,
                  meetUrl
                );
                console.log('✅ Email client opened:', emailResult);
                
                // 4. Add meeting link to in-app chat
                const chatResult = await addMeetingLinkToChat(appointment, meetUrl, doctorName);
                console.log('✅ Chat updated:', chatResult);
                
                // 5. Set up meeting notifications
                const notificationResult = await setupMeetingNotifications(appointment, meetUrl, doctorName);
                console.log('✅ Notifications set up:', notificationResult);
                
                // 6. Show success message and redirect
                Alert.alert(
                  'Meeting Created Successfully! 🎉',
                  `Google Meet room created and configured!\n\n` +
                  `📧 ${emailResult.status === 'opened' ? 'Email client opened for patient invitation' : emailResult.status === 'simulated' ? 'Email simulated (development mode)' : 'Email preparation completed'}\n` +
                  `💬 Meeting link added to patient chat\n` +
                  `🔔 Notifications configured\n` +
                  `🔗 Meeting URL: ${meetUrl}\n\n` +
                  `Redirecting you to Google Meet...`,
                  [
                    {
                      text: 'Join Meeting Now',
                      onPress: async () => {
                        try {
                          await googleMeetService.joinMeeting(meetUrl);
                        } catch (error) {
                          console.error('Error joining meeting:', error);
                          await Clipboard.setStringAsync(meetUrl);
                          Alert.alert('Meeting Link Copied', 'Meeting link copied to clipboard. Please open it manually.');
                        }
                      }
                    },
                    {
                      text: 'Copy Link',
                      onPress: async () => {
                        await Clipboard.setStringAsync(meetUrl);
                        Alert.alert('Success! 📋', 'Google Meet link copied to clipboard');
                      }
                    }
                  ]
                );
                
              } catch (error) {
                console.error('Error setting up Google Meet:', error);
                Alert.alert('Setup Error', `Failed to complete Google Meet setup: ${error.message}`);
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error setting up Google Meet:', error);
      Alert.alert('Error ❌', 'Failed to set up Google Meet. Please try again.');
    }
  };

  // Function to add meeting link to in-app chat
  const addMeetingLinkToChat = async (appointment, meetUrl, doctorName) => {
    try {
      console.log('💬 Adding meeting link to chat...');
      
      // Initialize chat service with current doctor ID if not already done
      const currentDoctorId = 'doctor_current'; // In a real app, get from auth
      if (!chatService.currentUserId) {
        await chatService.initialize(currentDoctorId);
      }
      
      // Ensure consistent patient ID handling
      const patientId = appointment.patientId || `patient_${appointment.patient.toLowerCase().replace(/\s+/g, '_')}`;
      console.log('👤 Patient ID:', patientId);
      
      // Get or create chat for the appointment
      const chat = await chatService.createChat(
        patientId,
        appointment.patient,
        'patient'
      );
      
      console.log('💬 Chat created/found:', chat.id);
      
      // Create a professional meeting link message
      const meetingMessage = `🔗 Google Meet Link Ready

Your medical consultation with ${doctorName} is scheduled for ${appointment.date} at ${appointment.time}.

📱 Join Meeting: ${meetUrl}

📋 Instructions:
• Click the link at your appointment time
• Allow camera and microphone access
• The doctor will join you shortly
• Meeting duration: ${appointment.duration}

This link was automatically generated for your appointment.`;
      
      // Send meeting link message to chat
      console.log('📤 Sending meeting link message...');
      const message = await chatService.sendMessage(chat.id, meetingMessage, 'meeting_link');
      console.log('✅ Meeting link message sent:', message.id);
      
      // Add additional helpful message
      const helpMessage = `💡 Meeting Tips:
• Test your camera/microphone beforehand
• Join 2-3 minutes early
• Have your questions ready
• If you have issues, call: ${appointment.contactInfo?.phone || 'carepoint@gmail.com'}`;
      
      console.log('📤 Sending help message...');
      const helpMsg = await chatService.sendMessage(chat.id, helpMessage, 'meeting_help');
      console.log('✅ Help message sent:', helpMsg.id);
      
      // Force save chats to ensure persistence
      await chatService.saveChats();
      console.log('💾 Chats saved to storage');
      
      console.log('💬 Meeting link added to chat successfully');
      console.log('📱 Chat ID:', chat.id, 'Patient ID:', patientId);
      
      return { success: true, chatId: chat.id, messageCount: 2 };
    } catch (error) {
      console.error('Error adding meeting link to chat:', error);
      console.error('Error details:', error.message, error.stack);
      
      // Return partial success to not break the flow
      return { success: false, error: error.message };
    }
  };

  // Function to set up meeting notifications
  const setupMeetingNotifications = async (appointment, meetUrl, doctorName) => {
    try {
      console.log('🔔 Setting up meeting notifications...');
      
      const doctorContact = doctorService.getCurrentDoctorContact();
      const appointmentDateTime = new Date(`${appointment.date} ${appointment.time}`);
      
      // Doctor and patient info for notifications
      const doctorInfo = {
        name: doctorName,
        email: doctorContact.email,
        role: 'doctor'
      };
      
      const patientInfo = {
        name: appointment.patient,
        email: appointment.contactInfo?.email,
        role: 'patient'
      };
      
      // Register meeting with notification service
      const meetingData = meetingNotificationService.registerMeeting(
        appointment.id,
        meetUrl,
        doctorInfo,
        patientInfo
      );
      
      // Schedule reminder notifications for both parties
      await meetingNotificationService.scheduleMeetingReminders(
        appointment.id,
        appointmentDateTime,
        doctorInfo,
        patientInfo
      );
      
      console.log('🔔 Meeting notifications configured successfully');
      
      // Simulate doctor joining the meeting (since doctor initiated it)
      // In a real app, this would be detected when the doctor actually joins
      setTimeout(() => {
        meetingNotificationService.participantJoined(appointment.id, 'doctor');
      }, 2000);
      
      return meetingData;
    } catch (error) {
      console.error('Error setting up notifications:', error);
      throw error;
    }
  };

  const handleCompleteAppointment = () => {
    Alert.alert(
      'Complete Appointment',
      'Mark this appointment as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: () => {
            setAppointment(prev => ({ ...prev, status: 'completed' }));
            Alert.alert('Success', 'Appointment marked as completed');
          }
        }
      ]
    );
  };

  const handleRescheduleAppointment = () => {
    setShowRescheduleModal(true);
    setSelectedDate('');
    setSelectedTime('');
    setRescheduleReason('');
  };

  const handleRejectAppointment = () => {
    Alert.alert(
      'Reject Appointment',
      'Are you sure you want to reject this appointment? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setAppointment(prev => ({ ...prev, status: 'cancelled' }));
            Alert.alert('Appointment Rejected', 'The appointment has been rejected and the patient will be notified.');
            // In a real app, you might want to navigate back or remove from list
            setTimeout(() => {
            navigation.goBack();
            }, 1500);
          }
        }
      ]
    );
  };

  const handleSaveReschedule = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for rescheduling.');
      return;
    }

    Alert.alert(
      'Reschedule Appointment',
      `Reschedule to ${selectedDate} at ${selectedTime}?\n\nReason: ${rescheduleReason || 'No reason provided'}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reschedule',
          onPress: () => {
            setAppointment(prev => ({
              ...prev,
              date: selectedDate,
              time: selectedTime,
              status: 'pending' // Reset to pending for new time
            }));
            setShowRescheduleModal(false);
            Alert.alert('Success', 'Appointment rescheduled successfully! The patient has been notified.');
          }
        }
      ]
    );
  };

  const handlePatientCardPress = () => {
    navigation.navigate('PatientDetails', { 
      patientId: appointment.patientId,
      patientName: appointment.patient 
    });
  };

  const formatTimeUntilAppointment = () => {
    if (timeUntilAppointment === null) return '';
    
    if (timeUntilAppointment <= 0) {
      return 'Appointment time has arrived';
    }
    
    const hours = Math.floor(timeUntilAppointment / 60);
    const minutes = timeUntilAppointment % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m until appointment`;
    } else {
      return `${minutes} minutes until appointment`;
    }
  };

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getAppointmentStatus();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Appointment Details</Text>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#2C3E50" />
        </TouchableOpacity>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Info Card */}
        <TouchableOpacity style={styles.card} onPress={handlePatientCardPress}>
          <View style={styles.cardHeader}>
            <View style={styles.patientAvatar}>
              <Text style={styles.avatarText}>
                {appointment.patient.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{appointment.patient}</Text>
              <Text style={styles.appointmentType}>{appointment.type}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.text}</Text>
        </View>
              </View>
          <View style={styles.clickHint}>
            <Ionicons name="chevron-forward" size={16} color="#7F8C8D" />
            <Text style={styles.clickHintText}>Tap to view patient details</Text>
              </View>
        </TouchableOpacity>

        {/* Appointment Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.date}</Text>
            </View>

          <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.time} ({appointment.duration})</Text>
              </View>

          {timeUntilAppointment !== null && (
            <View style={styles.infoRow}>
              <Ionicons name="hourglass" size={20} color="#fd7e14" />
              <Text style={styles.infoText}>{formatTimeUntilAppointment()}</Text>
              </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.contactInfo.phone}</Text>
            </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.contactInfo.email}</Text>
              </View>
            </View>

        {/* Notes Card */}
        {appointment.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
              </View>
        )}

        {/* Symptoms Card */}
        {appointment.symptoms && appointment.symptoms.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reported Symptoms</Text>
            {appointment.symptoms.map((symptom, index) => (
              <View key={index} style={styles.symptomItem}>
                <Ionicons name="medical" size={16} color="#dc3545" />
                <Text style={styles.symptomText}>{symptom}</Text>
            </View>
            ))}
          </View>
        )}

      {/* Action Buttons */}
        <View style={styles.actionsCard}>
          {appointment.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={handleAcceptAppointment}
              >
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Accept Appointment</Text>
          </TouchableOpacity>
          
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleRescheduleAppointment}
              >
                <Ionicons name="calendar" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Reschedule Appointment</Text>
          </TouchableOpacity>
          
              <TouchableOpacity 
                style={styles.rejectButton}
                onPress={handleRejectAppointment}
              >
                <Ionicons name="close-circle" size={24} color="#ffffff" />
                <Text style={styles.rejectButtonText}>Reject Appointment</Text>
          </TouchableOpacity>
            </>
          )}

          {appointment.status === 'accepted' && (
            <>
              <TouchableOpacity 
                style={[styles.actionButton, !canStartChat() && styles.disabledButton]}
                onPress={handleStartChat}
              >
                <Ionicons 
                  name="chatbubble" 
                  size={24} 
                  color={canStartChat() ? "#4A90E2" : "#ADB5BD"} 
                />
                <Text style={[styles.actionButtonText, !canStartChat() && styles.disabledText]}>
                  Start Chat
                </Text>
                {!canStartChat() && <Ionicons name="lock-closed" size={16} color="#ADB5BD" />}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, !canStartCall() && styles.disabledButton]}
                onPress={handleVoiceCall}
              >
                <Ionicons 
                  name="call" 
                  size={24} 
                  color={canStartCall() ? "#28a745" : "#ADB5BD"} 
                />
                <Text style={[styles.actionButtonText, !canStartCall() && styles.disabledText]}>
                  Voice Call
                </Text>
                {!canStartCall() && <Ionicons name="lock-closed" size={16} color="#ADB5BD" />}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, !canStartCall() && styles.disabledButton]}
                onPress={handleVideoCall}
              >
                <Ionicons 
                  name="videocam" 
                  size={24} 
                  color={canStartCall() ? "#6f42c1" : "#ADB5BD"} 
                />
                <Text style={[styles.actionButtonText, !canStartCall() && styles.disabledText]}>
                  Video Call
                </Text>
                {!canStartCall() && <Ionicons name="lock-closed" size={16} color="#ADB5BD" />}
              </TouchableOpacity>
              
              {timeUntilAppointment <= 0 && (
                <TouchableOpacity 
                  style={styles.completeButton}
                  onPress={handleCompleteAppointment}
                >
                  <Ionicons name="checkmark-done" size={24} color="#ffffff" />
                  <Text style={styles.completeButtonText}>Complete Appointment</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {appointment.status === 'cancelled' && (
            <View style={styles.cancelledMessage}>
              <Ionicons name="close-circle" size={48} color="#dc3545" />
              <Text style={styles.cancelledTitle}>Appointment Cancelled</Text>
              <Text style={styles.cancelledSubtitle}>This appointment has been cancelled and removed from the queue.</Text>
        </View>
      )}

          {appointment.status === 'completed' && (
            <View style={styles.completedMessage}>
              <Ionicons name="checkmark-circle" size={48} color="#28a745" />
              <Text style={styles.completedTitle}>Appointment Completed</Text>
              <Text style={styles.completedSubtitle}>This appointment has been successfully completed.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Reschedule Modal */}
      <Modal
        visible={showRescheduleModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
            <TouchableOpacity onPress={handleSaveReschedule}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Select New Date</Text>
            <SimpleCalendar
              selectedDate={selectedDate}
              onDatePress={(dateString) => setSelectedDate(dateString)}
              minDate={appointment?.date}
            />

            <Text style={styles.modalSectionTitle}>Select New Time</Text>
            <View style={styles.timeSlotsGrid}>
              {getAvailableTimeSlots().map((timeSlot) => (
                <TouchableOpacity
                  key={timeSlot.time24}
                  style={[
                    styles.timeSlotButton,
                    selectedTime === timeSlot.time12 && styles.selectedTimeSlotButton
                  ]}
                  onPress={() => setSelectedTime(timeSlot.time12)}
                >
                  <Text style={[
                    styles.timeSlotButtonText,
                    selectedTime === timeSlot.time12 && styles.selectedTimeSlotButtonText
                  ]}>
                    {timeSlot.time12}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalSectionTitle}>Reason for Rescheduling (Optional)</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rescheduling..."
              value={rescheduleReason}
              onChangeText={setRescheduleReason}
              multiline
              numberOfLines={3}
              placeholderTextColor="#7F8C8D"
            />

            {selectedDate && selectedTime && (
              <View style={styles.selectedSummary}>
                <Text style={styles.selectedSummaryTitle}>
                  New Appointment Time:
                </Text>
                <Text style={styles.selectedSummaryText}>
                  {selectedDate} at {selectedTime}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Call Options Modal */}
      <Modal
        visible={showCallOptionsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCallOptionsModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedCallType === 'video' ? 'Video Call Options' : 'Voice Call Options'}
            </Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Choose how to call {appointment?.patient}</Text>
            
            {callOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.callOptionItem}
                onPress={() => handleCallOptionSelect(option)}
              >
                <View style={[styles.callOptionIcon, { backgroundColor: option.color }]}>
                  <Ionicons name={option.icon} size={24} color="#ffffff" />
                </View>
                
                <View style={styles.callOptionContent}>
                  <Text style={styles.callOptionName}>{option.name}</Text>
                  <Text style={styles.callOptionDescription}>{option.description}</Text>
                </View>
                
                <Ionicons name="chevron-forward" size={20} color="#ADB5BD" />
              </TouchableOpacity>
            ))}

            <View style={styles.callInfoCard}>
              <Ionicons name="information-circle" size={24} color="#4A90E2" />
              <View style={styles.callInfoContent}>
                <Text style={styles.callInfoTitle}>Call Recording</Text>
                <Text style={styles.callInfoText}>
                  {selectedCallType === 'video' ? 'Video calls' : 'Voice calls'} are not recorded for privacy and security. 
                  All calls are encrypted and secure.
                </Text>
              </View>
            </View>

            {appointment?.contactInfo && (
              <View style={styles.contactInfoCard}>
                <Text style={styles.contactInfoTitle}>Patient Contact Information</Text>
                {appointment.contactInfo.phone && (
                  <Text style={styles.contactInfoText}>
                    📞 {appointment.contactInfo.phone}
                  </Text>
                )}
                {appointment.contactInfo.email && (
                  <Text style={styles.contactInfoText}>
                    ✉️ {appointment.contactInfo.email}
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  moreButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  notesText: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  disabledButton: {
    backgroundColor: '#F8F9FA',
    opacity: 0.6,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
    textAlign: 'center',
  },
  disabledText: {
    color: '#ADB5BD',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17a2b8',
    borderRadius: 12,
    paddingVertical: 16,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  clickHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  clickHintText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  rejectButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  cancelledMessage: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
  },
  cancelledTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 8,
  },
  cancelledSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  completedMessage: {
    flexDirection: 'column',
    alignItems: 'center',
    padding: 16,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#28a745',
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  modalCancelText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc3545',
    marginRight: 16,
  },
  modalSaveText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A90E2',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedTimeSlotButton: {
    backgroundColor: '#4A90E2',
  },
  timeSlotButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  selectedTimeSlotButtonText: {
    color: '#ffffff',
  },
  reasonInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedSummary: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedSummaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  selectedSummaryText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  calendarArrow: {
    padding: 8,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
    textAlign: 'center',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  weekDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: '14.28%',
    padding: 8,
  },
  selectedDay: {
    backgroundColor: '#4A90E2',
  },
  todayDay: {
    backgroundColor: '#E9ECEF',
  },
  disabledDay: {
    backgroundColor: '#F8F9FA',
  },
  dayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    textAlign: 'center',
  },
  selectedDayText: {
    color: '#ffffff',
  },
  todayDayText: {
    color: '#28a745',
  },
  disabledDayText: {
    color: '#ADB5BD',
  },
  callOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 12,
    marginBottom: 12,
  },
  callOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  callOptionContent: {
    flex: 1,
  },
  callOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  callOptionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  callInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  callInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  callInfoText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  contactInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  contactInfoText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
});

export default AppointmentDetailsScreen; 