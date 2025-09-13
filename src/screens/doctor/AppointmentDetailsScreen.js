import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppointmentService } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const AppointmentDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params;

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilAppointment, setTimeUntilAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [showCallOptionsModal, setShowCallOptionsModal] = useState(false);
  const [selectedCallType, setSelectedCallType] = useState('voice'); // 'voice' or 'video'
  const [updating, setUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  // Initialize AppointmentService with doctor data
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize AppointmentService with doctor user data
        const doctorUser = userData.doctor;
        await AppointmentService.initialize(doctorUser, 'doctor');
        console.log('📅 Appointment service initialized for doctor:', doctorUser.name);
        
        // Load appointment details after service initialization
        await loadAppointmentDetails();
        
        // Add listener for appointment changes to enable real-time updates
        const appointmentListener = (event, data) => {
          console.log('📅 Doctor appointment event received:', event, data);
          if ((event === 'appointment_updated' || event === 'appointment_rescheduled') && data.id === appointmentId) {
            console.log('📅 Refreshing appointment details due to event:', event);
            // Refresh appointment details when this specific appointment is updated
            loadAppointmentDetails();
          }
        };
        
        AppointmentService.addListener(appointmentListener);
        
        // Cleanup listener on unmount
        return () => {
          AppointmentService.removeListener(appointmentListener);
        };
      } catch (error) {
        console.error('Error initializing services:', error);
        Alert.alert('Error', 'Failed to initialize appointment service');
      }
    };

    initializeServices();
  }, []);

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
    const interval = setInterval(updateTimeUntilAppointment, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [appointmentId]);

  useEffect(() => {
    if (appointment) {
      updateTimeUntilAppointment();
    }
  }, [appointment]);

  const loadAppointmentDetails = async () => {
    try {
      setLoading(true);
      
      // Force refresh data to ensure we get the latest appointments
      await AppointmentService.refreshData();
      
      // Use the unified appointment service to get appointment details
      const appointments = await AppointmentService.getAllAppointments();
      const appointmentData = appointments.find(apt => apt.id === appointmentId);
      
    if (appointmentData) {
      setAppointment(appointmentData);
    } else {
      Alert.alert('Error', 'Appointment not found');
      navigation.goBack();
    }
    } catch (error) {
      console.error('Error loading appointment details:', error);
      Alert.alert('Error', 'Failed to load appointment details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateTimeUntilAppointment = () => {
    if (!appointment) return;

    const appointmentDateTime = new Date(appointment.appointmentDate);
    const now = new Date();
    const timeDiff = appointmentDateTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(timeDiff / (1000 * 60));

    setTimeUntilAppointment(minutesUntil);
  };

  const getAppointmentStatus = () => {
    if (!appointment) return { text: 'Unknown', color: '#6c757d' };

    switch (appointment.status) {
      case 'pending':
        return { text: 'Pending', color: '#ffc107' };
      case 'scheduled':
      case 'confirmed':
        return { text: 'Confirmed', color: '#28a745' };
      case 'cancelled':
      return { text: 'Cancelled', color: '#dc3545' };
      case 'completed':
        return { text: 'Completed', color: '#6c757d' };
      case 'rescheduled':
        return { text: 'Rescheduled', color: '#17a2b8' };
      default:
        return { text: 'Unknown', color: '#6c757d' };
    }
  };

  const canStartChat = () => {
    // Chat is available once appointment is confirmed/scheduled/rescheduled
    return appointment?.status === 'scheduled' || 
           appointment?.status === 'confirmed' || 
           appointment?.status === 'rescheduled';
  };

  const canStartCall = () => {
    // Calls are available 10 minutes before appointment time for confirmed appointments
    const validStatuses = appointment?.status === 'scheduled' || 
                         appointment?.status === 'confirmed' || 
                         appointment?.status === 'rescheduled';
    return validStatuses && timeUntilAppointment <= 10;
  };

  const handleAcceptAppointment = async () => {
    try {
      setUpdating(true);
      await AppointmentService.updateAppointmentStatus(appointmentId, 'scheduled', 'Appointment accepted by doctor');
      setAppointment(prev => ({ ...prev, status: 'scheduled' }));
      Alert.alert('Success', 'Appointment accepted successfully');
    } catch (error) {
      console.error('Error accepting appointment:', error);
      Alert.alert('Error', 'Failed to accept appointment');
    } finally {
      setUpdating(false);
    }
  };

  const handleRejectAppointment = async () => {
    Alert.alert(
      'Reject Appointment',
      `Are you sure you want to reject this appointment with ${appointment.patientName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await AppointmentService.updateAppointmentStatus(appointmentId, 'cancelled', 'Appointment rejected by doctor');
              setAppointment(prev => ({ ...prev, status: 'cancelled' }));
              Alert.alert('Success', 'Appointment rejected successfully');
            } catch (error) {
              console.error('Error rejecting appointment:', error);
              Alert.alert('Error', 'Failed to reject appointment');
            } finally {
              setUpdating(false);
            }
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
        appointment.patientName,
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

  const handleCallOptionSelect = async (option) => {
    setShowCallOptionsModal(false);
    
    try {
      let meetingUrl = '';
      
      switch (option.id) {
        case 'inapp':
          // Handle in-app call
          Alert.alert('In-App Call', 'Starting secure in-app call...');
          break;
          
        case 'whatsapp':
          // Open WhatsApp with patient's phone number
          const whatsappUrl = `whatsapp://send?phone=${appointment.patientPhone}&text=Hi ${appointment.patientName}, I'm ready for our appointment call.`;
          await Linking.openURL(whatsappUrl);
          break;
          
        case 'zoom':
          // Create Zoom meeting
          meetingUrl = await googleMeetService.createMeeting(
            `Appointment with ${appointment.patientName}`,
            appointment.appointmentDate
          );
          await Linking.openURL(meetingUrl);
          break;
          
        case 'gmail':
          // Create Google Meet
          meetingUrl = await googleMeetService.createMeeting(
            `Appointment with ${appointment.patientName}`,
            appointment.appointmentDate
          );
          await Linking.openURL(meetingUrl);
          break;
      }
      
      // Send notification to patient
      await notificationService.sendNotification(
        appointment.patientId,
        'Call Started',
        `Your doctor has started the ${selectedCallType} call for your appointment.`
      );
      
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Error', 'Failed to start call');
    }
  };

  const handleRescheduleAppointment = () => {
    setShowRescheduleModal(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleDateSelect = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      setTempDate(selectedDate);
      const dateString = selectedDate.toISOString().split('T')[0];
      console.log('📅 Date selected:', dateString);
      setSelectedDate(dateString);
    }
  };

  const handleTimeSelect = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      console.log('📅 Time selected:', timeString);
      setSelectedTime(timeString);
    }
  };

  const showDatePickerModal = () => {
    console.log('📅 Opening native date picker');
    setShowDatePicker(true);
  };

  const showTimePickerModal = () => {
    console.log('📅 Opening native time picker');
    setShowTimePicker(true);
  };

  // Generate available dates for the next 30 days
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    console.log('📅 Generated available dates:', dates.length);
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleSaveReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for rescheduling.');
      return;
    }

    try {
      setUpdating(true);
      
      console.log('📅 Doctor rescheduling appointment:', {
        appointmentId,
        selectedDate,
        selectedTime,
        reason: rescheduleReason || 'Rescheduled by doctor'
      });
      
      // Call reschedule function with consistent date format
      const updatedAppointment = await AppointmentService.rescheduleAppointment(
        appointmentId,
        selectedDate, // Already in YYYY-MM-DD format
        selectedTime,
        rescheduleReason || 'Rescheduled by doctor'
      );
      
      // Update local state with the returned appointment data
      setAppointment(updatedAppointment);
      
      // Reset modal state
      setShowRescheduleModal(false);
      setSelectedDate('');
      setSelectedTime('');
      setRescheduleReason('');
      
      Alert.alert('Success', 'Appointment rescheduled successfully! The patient has been notified and the appointment is confirmed.');
      
      // Refresh appointment details to ensure sync
      await loadAppointmentDetails();
      
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      Alert.alert('Error', `Failed to reschedule appointment: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCompleteAppointment = async () => {
    try {
      setUpdating(true);
      await AppointmentService.updateAppointmentStatus(appointmentId, 'completed', 'Appointment completed');
      setAppointment(prev => ({ ...prev, status: 'completed' }));
      Alert.alert('Success', 'Appointment marked as completed');
    } catch (error) {
      console.error('Error completing appointment:', error);
      Alert.alert('Error', 'Failed to complete appointment');
    } finally {
      setUpdating(false);
    }
  };

  const handleRescheduleRequest = async (approved) => {
    if (!appointment.rescheduleRequest) {
      Alert.alert('Error', 'No reschedule request found');
      return;
    }

    let doctorNotes = '';
    if (!approved) {
      // Prompt for rejection reason
      Alert.prompt(
        'Reject Reschedule Request',
        'Please provide a reason for rejection:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
            onPress: async (reason) => {
              if (reason?.trim()) {
                try {
                  setUpdating(true);
                  await AppointmentService.handleRescheduleRequest(appointmentId, false, reason.trim());
                  setAppointment(prev => ({
                    ...prev,
                    status: 'confirmed',
                    rescheduleRequest: {
                      ...prev.rescheduleRequest,
                      status: 'rejected',
                      doctorNotes: reason.trim()
                    }
                  }));
                  Alert.alert('Success', 'Reschedule request rejected');
                } catch (error) {
                  console.error('Error rejecting reschedule request:', error);
                  Alert.alert('Error', 'Failed to reject reschedule request');
                } finally {
                  setUpdating(false);
                }
              }
            }
          }
        ],
        'plain-text'
      );
      return;
    }

    // Approve the request
    try {
      setUpdating(true);
      await AppointmentService.handleRescheduleRequest(appointmentId, true, 'Reschedule request approved');
            setAppointment(prev => ({
              ...prev,
        appointmentDate: prev.rescheduleRequest.requestedDate,
        appointmentTime: prev.rescheduleRequest.requestedTime,
        status: 'rescheduled',
        rescheduleRequest: {
          ...prev.rescheduleRequest,
          status: 'approved'
        }
      }));
      Alert.alert('Success', 'Reschedule request approved');
    } catch (error) {
      console.error('Error approving reschedule request:', error);
      Alert.alert('Error', 'Failed to approve reschedule request');
    } finally {
      setUpdating(false);
    }
  };

  const handlePatientCardPress = () => {
    navigation.navigate('PatientDetails', { 
      patientId: appointment.patientId,
      patientName: appointment.patientName 
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading appointment details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Appointment not found</Text>
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
                {appointment.patientName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{appointment.patientName}</Text>
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
            <Text style={styles.infoText}>
              {new Date(appointment.appointmentDate).toLocaleDateString()}
            </Text>
            </View>

          <View style={styles.infoRow}>
                <Ionicons name="time" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>
              {appointment.appointmentTime} ({appointment.duration || 30} min)
            </Text>
              </View>

          {timeUntilAppointment !== null && (
            <View style={styles.infoRow}>
              <Ionicons name="hourglass" size={20} color="#fd7e14" />
              <Text style={styles.infoText}>{formatTimeUntilAppointment()}</Text>
              </View>
          )}
          
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.patientPhone}</Text>
            </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.patientEmail}</Text>
              </View>
            </View>

        {/* Notes Card */}
        {appointment.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
              </View>
        )}

        {/* Reason Card */}
        {appointment.reason && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reason for Visit</Text>
            <Text style={styles.notesText}>{appointment.reason}</Text>
          </View>
        )}

      {/* Action Buttons */}
        <View style={styles.actionsCard}>
          {appointment.status === 'pending' && (
            <>
              <TouchableOpacity 
                style={[styles.primaryButton, updating && styles.disabledButton]}
                onPress={handleAcceptAppointment}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                )}
                <Text style={styles.primaryButtonText}>
                  {updating ? 'Accepting...' : 'Accept Appointment'}
                </Text>
          </TouchableOpacity>
          
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleRescheduleAppointment}
              >
                <Ionicons name="calendar" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Reschedule Appointment</Text>
          </TouchableOpacity>
          
              <TouchableOpacity 
                style={[styles.rejectButton, updating && styles.disabledButton]}
                onPress={handleRejectAppointment}
                disabled={updating}
              >
                <Ionicons name="close-circle" size={24} color="#ffffff" />
                <Text style={styles.rejectButtonText}>Reject Appointment</Text>
          </TouchableOpacity>
            </>
          )}

          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
            <>
              <TouchableOpacity 
                style={[styles.primaryButton, !canStartChat() && styles.disabledButton]}
                onPress={handleStartChat}
                disabled={!canStartChat()}
              >
                <Ionicons name="chatbubble" size={24} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Start Chat</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.secondaryButton, !canStartCall() && styles.disabledButton]}
                onPress={handleVoiceCall}
                disabled={!canStartCall()}
              >
                <Ionicons name="call" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Voice Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.secondaryButton, !canStartCall() && styles.disabledButton]}
                onPress={handleVideoCall}
                disabled={!canStartCall()}
              >
                <Ionicons name="videocam" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Video Call</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleRescheduleAppointment}
              >
                <Ionicons name="calendar" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Reschedule Appointment</Text>
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

          {appointment.status === 'reschedule_requested' && appointment.rescheduleRequest && (
            <>
              <View style={styles.rescheduleRequestCard}>
                <Text style={styles.rescheduleRequestTitle}>Reschedule Request</Text>
                <Text style={styles.rescheduleRequestText}>
                  Patient requests: {AppointmentService.formatDateForDisplay(appointment.rescheduleRequest.requestedDate)} at {appointment.rescheduleRequest.requestedTime}
                </Text>
                {appointment.rescheduleRequest.reason && (
                  <Text style={styles.rescheduleRequestReason}>
                    Reason: {appointment.rescheduleRequest.reason}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.primaryButton, updating && styles.disabledButton]}
                onPress={() => handleRescheduleRequest(true)}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                )}
                <Text style={styles.primaryButtonText}>
                  {updating ? 'Approving...' : 'Approve Request'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.rejectButton, updating && styles.disabledButton]}
                onPress={() => handleRescheduleRequest(false)}
                disabled={updating}
              >
                <Ionicons name="close-circle" size={24} color="#ffffff" />
                <Text style={styles.rejectButtonText}>Reject Request</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleRescheduleAppointment}
              >
                <Ionicons name="calendar" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Suggest Different Time</Text>
              </TouchableOpacity>
            </>
          )}

          {appointment.status === 'rescheduled' && (
            <>
              <View style={styles.rescheduleInfoCard}>
                <Text style={styles.rescheduleInfoTitle}>Appointment Rescheduled</Text>
                <Text style={styles.rescheduleInfoText}>
                  New time: {AppointmentService.formatDateForDisplay(appointment.appointmentDate)} at {appointment.appointmentTime}
                </Text>
                <Text style={styles.rescheduleInfoText}>
                  Status: Pending patient acceptance
                </Text>
              </View>
              
              <TouchableOpacity 
                style={[styles.primaryButton, !canStartChat() && styles.disabledButton]}
                onPress={handleStartChat}
                disabled={!canStartChat()}
              >
                <Ionicons name="chatbubble" size={24} color="#ffffff" />
                <Text style={styles.primaryButtonText}>Start Chat</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.secondaryButton}
                onPress={handleRescheduleAppointment}
              >
                <Ionicons name="calendar" size={24} color="#4A90E2" />
                <Text style={styles.secondaryButtonText}>Reschedule Again</Text>
              </TouchableOpacity>
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
        transparent={true}
        onRequestClose={() => setShowRescheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <TouchableOpacity 
                onPress={() => setShowRescheduleModal(false)}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

            <ScrollView style={styles.modalBody}>
              {/* Date Selection */}
            <Text style={styles.modalSectionTitle}>Select New Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={showDatePickerModal}
              >
                <Text style={styles.dateInputText}>
                  {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Select Date'}
                </Text>
                <Ionicons name="calendar" size={20} color="#4A90E2" />
              </TouchableOpacity>

              {/* Time Selection */}
              <Text style={styles.modalSectionTitle}>Select New Time</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={showTimePickerModal}
              >
                <Text style={styles.dateInputText}>
                  {selectedTime ? selectedTime : 'Select Time'}
                </Text>
                <Ionicons name="time" size={20} color="#4A90E2" />
              </TouchableOpacity>

              {/* Reason */}
              <Text style={styles.modalSectionTitle}>Reason for Rescheduling</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="Enter reason for rescheduling..."
              value={rescheduleReason}
              onChangeText={setRescheduleReason}
              multiline
              numberOfLines={3}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowRescheduleModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveReschedule}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Native Date Picker for Android */}
      {showDatePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          minimumDate={new Date()}
          maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
          onChange={handleDateSelect}
        />
      )}

      {/* Native Time Picker for Android */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeSelect}
        />
      )}

      {/* iOS Date Picker Modal */}
      {showDatePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity 
                  onPress={() => setShowDatePicker(false)}
                  style={styles.closeModalButton}
                >
                  <Ionicons name="close" size={24} color="#2C3E50" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Select a date for the new appointment</Text>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  minimumDate={new Date()}
                  maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  onChange={handleDateSelect}
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.saveButtonText}>Save Date</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* iOS Time Picker Modal */}
      {showTimePicker && Platform.OS === 'ios' && (
        <Modal
          visible={showTimePicker}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Time</Text>
                <TouchableOpacity 
                  onPress={() => setShowTimePicker(false)}
                  style={styles.closeModalButton}
                >
                  <Ionicons name="close" size={24} color="#2C3E50" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <Text style={styles.modalSubtitle}>Select a time for the new appointment</Text>
                <DateTimePicker
                  value={tempDate}
                  mode="time"
                  display="spinner"
                  is24Hour={false}
                  onChange={handleTimeSelect}
                />
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.saveButton}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.saveButtonText}>Save Time</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Call Options Modal */}
      <Modal
        visible={showCallOptionsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCallOptionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Call Method</Text>
              <TouchableOpacity 
                onPress={() => setShowCallOptionsModal(false)}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>

            <ScrollView style={styles.modalBody}>
            {callOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                  style={styles.callOption}
                onPress={() => handleCallOptionSelect(option)}
              >
                <View style={[styles.callOptionIcon, { backgroundColor: option.color }]}>
                    <Ionicons name={option.icon} size={20} color="white" />
                </View>
                <View style={styles.callOptionContent}>
                  <Text style={styles.callOptionName}>{option.name}</Text>
                  <Text style={styles.callOptionDescription}>{option.description}</Text>
                </View>
                  <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
              </TouchableOpacity>
            ))}
            </ScrollView>
              </View>
            </View>
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
    marginTop: 10,
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
  clickHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  clickHintText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
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
  actionsCard: {
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
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  rejectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  rejectButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#17a2b8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  cancelledMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  cancelledTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#dc3545',
    marginTop: 12,
    marginBottom: 8,
  },
  cancelledSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  completedMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#28a745',
    marginTop: 12,
    marginBottom: 8,
  },
  completedSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  closeModalButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  dateInputText: {
    flex: 1,
    marginRight: 10,
    color: '#2C3E50',
  },
  timeSlotsContainer: {
    marginBottom: 16,
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  selectedTimeSlot: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeSlotText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectedTimeSlotText: {
    color: '#ffffff',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  callOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
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
  datePicker: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 12,
    textAlign: 'center',
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 8,
  },
  dateGridItem: {
    width: '30%', // Increased width for better touch targets
    height: 80, // Fixed height for consistent layout
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#ffffff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateGridDay: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    marginBottom: 2,
  },
  dateGridDate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  dateGridMonth: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  selectedDateGridItem: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
    elevation: 4,
    shadowOpacity: 0.2,
  },
  selectedDateGridDay: {
    color: '#ffffff',
    fontWeight: '600',
  },
  selectedDateGridDate: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selectedDateGridMonth: {
    color: '#ffffff',
    fontWeight: '600',
  },
  rescheduleRequestCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rescheduleRequestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  rescheduleRequestText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  rescheduleRequestReason: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  rescheduleInfoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  rescheduleInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  rescheduleInfoText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
});

export default AppointmentDetailsScreen; 