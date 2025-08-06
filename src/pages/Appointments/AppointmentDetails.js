import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppointmentService from '../../services/AppointmentService';
import { useAuth } from '../../context/AuthContext';

const PatientAppointmentDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { appointmentId } = route.params;
  const { user } = useAuth();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilAppointment, setTimeUntilAppointment] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [showCallOptionsModal, setShowCallOptionsModal] = useState(false);
  const [selectedCallType, setSelectedCallType] = useState('voice');
  const [updating, setUpdating] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialize AppointmentService with patient data
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Initialize AppointmentService with patient user data
        await AppointmentService.initialize(user, 'patient');
        console.log('📅 Appointment service initialized for patient:', user.name);
        
        // Load appointment details after service initialization
        await loadAppointmentDetails();
        
        // Add listener for appointment changes to enable real-time updates
        const appointmentListener = (event, data) => {
          console.log('📅 Appointment event received:', event, data);
          if (event === 'appointment_updated' && data.id === appointmentId) {
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

  // Generate available time slots for rescheduling
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
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
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Check if a time slot is available (simplified for demo)
  const isTimeSlotAvailable = (timeSlot) => {
    // In a real app, this would check against doctor's availability
    return true;
  };

  // Get available time slots
  const getAvailableTimeSlots = () => {
    return timeSlots.filter(isTimeSlotAvailable);
  };

  // Load appointment details
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

  // Update time until appointment
  const updateTimeUntilAppointment = () => {
    if (!appointment) return;
    
    const now = new Date();
    const appointmentTime = new Date(appointment.appointmentDate);
    const timeDiff = appointmentTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(timeDiff / (1000 * 60));
    
    setTimeUntilAppointment(minutesUntil);
  };

  // Update time every minute
  useEffect(() => {
    updateTimeUntilAppointment();
    const interval = setInterval(updateTimeUntilAppointment, 60000);
    return () => clearInterval(interval);
  }, [appointment]);

  // Get appointment status info
  const getAppointmentStatus = () => {
    if (!appointment) return { color: '#757575', text: 'Unknown', icon: 'help-circle' };
    
    switch (appointment.status) {
      case 'scheduled':
      case 'confirmed':
        return { color: '#4caf50', text: 'Confirmed', icon: 'checkmark-circle' };
      case 'pending':
        return { color: '#ff9800', text: 'Pending', icon: 'time' };
      case 'cancelled':
        return { color: '#f44336', text: 'Cancelled', icon: 'close-circle' };
      case 'completed':
        return { color: '#2196f3', text: 'Completed', icon: 'checkmark-done-circle' };
      case 'rescheduled':
        return { color: '#9c27b0', text: 'Rescheduled', icon: 'calendar' };
      default:
        return { color: '#757575', text: 'Unknown', icon: 'help-circle' };
    }
  };

  // Check if patient can start chat
  const canStartChat = () => {
    return appointment && (
      appointment.status === 'confirmed' || 
      appointment.status === 'scheduled' ||
      appointment.status === 'rescheduled' // Added rescheduled status
    );
  };

  // Check if patient can start call
  const canStartCall = () => {
    return appointment && (
      appointment.status === 'confirmed' || 
      appointment.status === 'scheduled' ||
      appointment.status === 'rescheduled' // Added rescheduled status
    );
  };

  // Handle reschedule request
  const handleRescheduleRequest = () => {
    setShowRescheduleModal(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleAcceptReschedule = async () => {
    try {
      setUpdating(true);
      
      // Accept the rescheduled appointment
      await AppointmentService.updateAppointmentStatus(appointmentId, 'confirmed', 'Patient accepted rescheduled appointment');
      
      setAppointment(prev => ({
        ...prev,
        status: 'confirmed'
      }));
      
      Alert.alert('Success', 'Appointment confirmed! You can now start chat or calls when available.');
    } catch (error) {
      console.error('Error accepting reschedule:', error);
      Alert.alert('Error', 'Failed to accept rescheduled appointment');
    } finally {
      setUpdating(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date.toISOString().split('T')[0]);
    setShowDatePicker(false);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
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
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  const handleSaveRescheduleRequest = async () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please select both date and time for rescheduling.');
      return;
    }

    try {
      setUpdating(true);
      
      // Use the new date creation method to avoid timezone issues
      const newDateTime = AppointmentService.createDateTimeFromStrings(selectedDate, selectedTime);
      
      if (!newDateTime) {
        throw new Error('Invalid date or time format');
      }
      
      console.log('📅 Requesting appointment reschedule:', {
        appointmentId,
        selectedDate,
        selectedTime,
        newDateTime: newDateTime.toISOString(),
        localDate: newDateTime.toLocaleDateString(),
        localTime: newDateTime.toLocaleTimeString()
      });
      
      // Create reschedule request (this would be sent to doctor for approval)
      await AppointmentService.createRescheduleRequest(
        appointmentId,
        newDateTime.toISOString(),
        selectedTime,
        rescheduleReason || 'Reschedule requested by patient'
      );
      
      setAppointment(prev => ({
        ...prev,
        status: 'reschedule_requested',
        rescheduleRequest: {
          requestedDate: newDateTime.toISOString(),
          requestedTime: selectedTime,
          reason: rescheduleReason || 'Reschedule requested by patient',
          requestedBy: 'patient',
          status: 'pending'
        }
      }));
      
      setShowRescheduleModal(false);
      Alert.alert('Success', 'Reschedule request sent to doctor! You will be notified when they respond.');
    } catch (error) {
      console.error('Error requesting reschedule:', error);
      Alert.alert('Error', `Failed to request reschedule: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelAppointment = async () => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await AppointmentService.cancelAppointment(appointmentId, 'Cancelled by patient');
              setAppointment(prev => ({ ...prev, status: 'cancelled' }));
              Alert.alert('Success', 'Appointment cancelled successfully');
            } catch (error) {
              console.error('Error cancelling appointment:', error);
              Alert.alert('Error', 'Failed to cancel appointment');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleStartChat = async () => {
    try {
      // Navigate to chat screen
      navigation.navigate('ChatScreen', { 
        appointmentId: appointment.id,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  const handleVoiceCall = async () => {
    setSelectedCallType('voice');
    setShowCallOptionsModal(true);
  };

  const handleVideoCall = async () => {
    setSelectedCallType('video');
    setShowCallOptionsModal(true);
  };

  const handleCallOptionSelect = async (option) => {
    setShowCallOptionsModal(false);
    
    try {
      if (option === 'voice') {
        // Handle voice call
        Alert.alert('Voice Call', 'Initiating voice call with doctor...');
      } else if (option === 'video') {
        // Handle video call
        Alert.alert('Video Call', 'Initiating video call with doctor...');
      }
    } catch (error) {
      console.error('Error starting call:', error);
      Alert.alert('Error', 'Failed to start call');
    }
  };

  const handleDoctorCardPress = () => {
    navigation.navigate('DoctorProfile', { 
      doctorId: appointment.doctorId,
      doctorName: appointment.doctorName 
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIndicator, { backgroundColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon} size={24} color="white" />
          </View>
          <View style={styles.statusInfo}>
            <Text style={styles.statusText}>{statusInfo.text}</Text>
            <Text style={styles.appointmentType}>{appointment.type}</Text>
          </View>
        </View>

        {/* Doctor Card */}
        <TouchableOpacity style={styles.card} onPress={handleDoctorCardPress}>
          <Text style={styles.cardTitle}>Doctor Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="person" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.doctorName}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="medical" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.doctorSpecialty}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.doctorEmail}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>Contact via app</Text>
          </View>
        </TouchableOpacity>

        {/* Appointment Information */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Appointment Information</Text>
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>
              {AppointmentService.formatDateForDisplay(appointment.appointmentDate)}
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
            <Ionicons name="document-text" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>{appointment.reason}</Text>
          </View>
        </View>

        {/* Notes Card */}
        {appointment.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{appointment.notes}</Text>
          </View>
        )}

        {/* Reschedule Request Card */}
        {appointment.rescheduleRequest && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reschedule Request</Text>
            <Text style={styles.notesText}>
              Requested: {AppointmentService.formatDateForDisplay(appointment.rescheduleRequest.requestedDate)} at {appointment.rescheduleRequest.requestedTime}
            </Text>
            <Text style={styles.notesText}>
              Status: {appointment.rescheduleRequest.status}
            </Text>
            {appointment.rescheduleRequest.reason && (
              <Text style={styles.notesText}>
                Reason: {appointment.rescheduleRequest.reason}
              </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {appointment.status === 'pending' && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ff9800' }]} onPress={handleRescheduleRequest}>
              <Ionicons name="calendar" size={20} color="white" />
              <Text style={styles.actionButtonText}>Request Reschedule</Text>
            </TouchableOpacity>
          )}

          {appointment.status === 'reschedule_requested' && appointment.rescheduleRequest && (
            <>
              <View style={styles.rescheduleRequestInfo}>
                <Text style={styles.rescheduleRequestTitle}>Reschedule Request Sent</Text>
                <Text style={styles.rescheduleRequestText}>
                  Waiting for doctor's response...
                </Text>
              </View>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f44336' }]} onPress={handleCancelAppointment}>
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </>
          )}

          {appointment.status === 'rescheduled' && (
            <>
              <View style={styles.rescheduleInfo}>
                <Text style={styles.rescheduleInfoTitle}>Appointment Rescheduled</Text>
                <Text style={styles.rescheduleInfoText}>
                  New time: {AppointmentService.formatDateForDisplay(appointment.appointmentDate)} at {appointment.appointmentTime}
                </Text>
              </View>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4caf50' }]} onPress={handleAcceptReschedule}>
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Accept New Time</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ff9800' }]} onPress={handleRescheduleRequest}>
                <Ionicons name="calendar" size={20} color="white" />
                <Text style={styles.actionButtonText}>Request Different Time</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f44336' }]} onPress={handleCancelAppointment}>
                <Ionicons name="close-circle" size={20} color="white" />
                <Text style={styles.actionButtonText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </>
          )}

          {canStartChat() && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4A90E2' }]} onPress={handleStartChat}>
              <Ionicons name="chatbubble" size={20} color="white" />
              <Text style={styles.actionButtonText}>Start Chat</Text>
            </TouchableOpacity>
          )}

          {canStartCall() && (
            <>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#28a745' }]} onPress={handleVoiceCall}>
                <Ionicons name="call" size={20} color="white" />
                <Text style={styles.actionButtonText}>Voice Call</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#9c27b0' }]} onPress={handleVideoCall}>
                <Ionicons name="videocam" size={20} color="white" />
                <Text style={styles.actionButtonText}>Video Call</Text>
              </TouchableOpacity>
            </>
          )}

          {(appointment.status === 'confirmed' || appointment.status === 'scheduled') && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#ff9800' }]} onPress={handleRescheduleRequest}>
              <Ionicons name="calendar" size={20} color="white" />
              <Text style={styles.actionButtonText}>Request Reschedule</Text>
            </TouchableOpacity>
          )}

          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#f44336' }]} onPress={handleCancelAppointment}>
              <Ionicons name="close-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>Cancel Appointment</Text>
            </TouchableOpacity>
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
              <Text style={styles.modalTitle}>Request Reschedule</Text>
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
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotsContainer}>
                {getAvailableTimeSlots().map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      selectedTime === slot.time24 && styles.selectedTimeSlot
                    ]}
                    onPress={() => setSelectedTime(slot.time24)}
                  >
                    <Text style={[
                      styles.timeSlotText,
                      selectedTime === slot.time24 && styles.selectedTimeSlotText
                    ]}>
                      {slot.time12}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Reason */}
              <Text style={styles.modalSectionTitle}>Reason for Reschedule Request</Text>
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
                onPress={handleSaveRescheduleRequest}
                disabled={updating}
              >
                <Text style={styles.saveButtonText}>
                  {updating ? 'Sending...' : 'Send Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
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

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Select a date from the next 30 days</Text>
              <View style={styles.dateGrid}>
                {availableDates.map((date, index) => {
                  const dateString = date.toISOString().split('T')[0];
                  const isSelected = dateString === selectedDate;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dateGridItem,
                        isSelected && styles.selectedDateGridItem
                      ]}
                      onPress={() => handleDateSelect(date)}
                    >
                      <Text style={[
                        styles.dateGridDay,
                        isSelected && styles.selectedDateGridDay
                      ]}>
                        {date.toLocaleDateString('en', { weekday: 'short' })}
                      </Text>
                      <Text style={[
                        styles.dateGridDate,
                        isSelected && styles.selectedDateGridDate
                      ]}>
                        {date.getDate()}
                      </Text>
                      <Text style={[
                        styles.dateGridMonth,
                        isSelected && styles.selectedDateGridMonth
                      ]}>
                        {date.toLocaleDateString('en', { month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

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

            <View style={styles.modalBody}>
              <TouchableOpacity
                style={styles.callOption}
                onPress={() => handleCallOptionSelect('voice')}
              >
                <Ionicons name="call" size={32} color="#28a745" />
                <Text style={styles.callOptionText}>Voice Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callOption}
                onPress={() => handleCallOptionSelect('video')}
              >
                <Ionicons name="videocam" size={32} color="#9c27b0" />
                <Text style={styles.callOptionText}>Video Call</Text>
              </TouchableOpacity>
            </View>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  appointmentType: {
    fontSize: 14,
    color: '#7F8C8D',
    textTransform: 'capitalize',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
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
    flex: 1,
  },
  notesText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeModalButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 15,
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
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
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
    color: '#FFFFFF',
    fontWeight: '600',
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#2C3E50',
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    width: '14%',
    alignItems: 'center',
    marginVertical: 8,
  },
  dateGridDay: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  selectedDateGridItem: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
  },
  selectedDateGridDay: {
    color: '#ffffff',
  },
  dateGridDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 4,
  },
  selectedDateGridDate: {
    color: '#ffffff',
  },
  dateGridMonth: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  selectedDateGridMonth: {
    color: '#ffffff',
  },
  callOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  callOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 15,
  },
  rescheduleRequestInfo: {
    backgroundColor: '#f0f9eb',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  rescheduleRequestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#67c23a',
    marginBottom: 5,
  },
  rescheduleRequestText: {
    fontSize: 14,
    color: '#67c23a',
  },
  rescheduleInfo: {
    backgroundColor: '#e1f3d8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  rescheduleInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#67c23a',
    marginBottom: 5,
  },
  rescheduleInfoText: {
    fontSize: 14,
    color: '#67c23a',
  },
});

export default PatientAppointmentDetails; 