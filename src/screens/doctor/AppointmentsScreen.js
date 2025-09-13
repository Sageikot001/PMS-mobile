import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { notificationService, AppointmentService, APPOINTMENT_STATUS } from '../../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userData } from '../../data/dummyUser';
import { BackendService } from '../../lib/api';

const { height: screenHeight } = Dimensions.get('window');

// Simple custom calendar component
const SimpleCalendar = ({ selectedDate, onDatePress, markedDates = {} }) => {
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
      days.push({
        day,
        dateString,
        isToday: dateString === new Date().toISOString().split('T')[0],
        isSelected: dateString === selectedDate,
        hasAppointments: markedDates[dateString]
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
            ]}
            onPress={() => dayData && onDatePress(dayData.dateString)}
            disabled={!dayData}
          >
            {dayData && (
              <>
                <Text style={[
                  styles.dayText,
                  dayData.isSelected && styles.selectedDayText,
                  dayData.isToday && styles.todayDayText,
                ]}>
                  {dayData.day}
                </Text>
                {dayData.hasAppointments && (
                  <View style={styles.appointmentDot} />
                )}
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const DoctorAppointmentsScreen = () => {
  const navigation = useNavigation();
  
  // Helper function to get today's date safely
  const getTodaysDate = () => {
    try {
      return new Date().toISOString().split('T')[0];
    } catch (error) {
      console.error('Error getting today\'s date:', error);
      return '2025-06-15'; // Fallback date
    }
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodaysDate());
  const [calendarHeight] = useState(new Animated.Value(350)); // Initial calendar height
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(true);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize notification service when component mounts
  useEffect(() => {
    initializeAndScheduleNotifications();
    loadAppointments();
    
    // Add listener for appointment changes to enable real-time updates
    const appointmentListener = (event, data) => {
      console.log('📅 Appointment event received:', event, data);
      if (event === 'appointment_created' || event === 'appointment_updated' || event === 'appointment_cancelled') {
        // Refresh appointments when any appointment changes
        loadAppointments();
      }
    };
    
    AppointmentService.addListener(appointmentListener);
    
    // Cleanup listener on unmount
    return () => {
      AppointmentService.removeListener(appointmentListener);
    };
  }, []);

  // Load appointments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
    }, [])
  );

  // Load appointments for the doctor
  const loadAppointments = async () => {
    try {
      setLoading(true);
      console.log('👨‍⚕️ Loading appointments for doctor...');
      
      // Initialize AppointmentService with doctor data
      const doctorUser = userData.doctor;
      console.log('👨‍⚕️ Initializing service with doctor:', doctorUser.name);
      
      await AppointmentService.initialize(doctorUser, 'doctor');
      
      // Force refresh data to ensure we get the latest appointments
      console.log('👨‍⚕️ Refreshing data from storage...');
      await AppointmentService.refreshData();
      
      // Get doctor's appointments
      const doctorAppointments = await AppointmentService.getMyAppointments();
      console.log('👨‍⚕️ Raw appointments from service:', doctorAppointments);
      
      if (!Array.isArray(doctorAppointments)) {
        console.error('👨‍⚕️ Invalid appointments data received:', doctorAppointments);
        setAppointments([]);
        return;
      }
      
      setAppointments(doctorAppointments);
      
      console.log(`👨‍⚕️ Loaded ${doctorAppointments.length} appointments for professional portal`);
      
      // Schedule notifications for appointments
      scheduleAppointmentNotifications();
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments. Please try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Update notifications when appointments change
  useEffect(() => {
    if (appointments.length > 0) {
      scheduleAppointmentNotifications();
    }
  }, [appointments]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId, newStatus, notes = '') => {
    try {
      await AppointmentService.updateAppointmentStatus(appointmentId, newStatus, notes);
      Alert.alert('Success', `Appointment ${newStatus} successfully`);
      loadAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'Failed to update appointment status');
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = (appointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel the appointment with ${appointment.patientName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.prompt(
              'Cancel Appointment',
              'Please provide a reason for cancellation:',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Cancel',
                  onPress: async (reason) => {
                    if (reason?.trim()) {
                      try {
                        await AppointmentService.cancelAppointment(appointment.id, reason.trim());
                        Alert.alert('Success', 'Appointment cancelled successfully');
                        loadAppointments();
                      } catch (error) {
                        console.error('Error cancelling appointment:', error);
                        Alert.alert('Error', 'Failed to cancel appointment');
                      }
                    }
                  }
                }
              ],
              'plain-text'
            );
          }
        }
      ]
    );
  };

  const initializeAndScheduleNotifications = async () => {
    try {
      // Initialize notification service
      await notificationService.initialize();
      
      // Add a small delay to ensure service is fully ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Schedule notifications for existing appointments
      scheduleAppointmentNotifications();
      
      console.log('Notification service initialized and appointments scheduled');
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const scheduleAppointmentNotifications = () => {
    try {
      // Check if notification service is running
      if (!notificationService.isServiceRunning) {
        console.warn('Notification service is not running, skipping notification scheduling');
        return;
      }

      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Convert real appointments to the format expected by notification service
      appointments.forEach(appointment => {
        if (!appointment || !appointment.id || !appointment.appointmentTime || !appointment.patientName) {
          console.warn('Invalid appointment data:', appointment);
          return;
        }

        const appointmentDate = new Date(appointment.appointmentDate).toISOString().split('T')[0];
        
        // Only schedule notifications for today and future dates
        if (appointmentDate >= today) {
          const notificationAppointment = {
            id: appointment.id,
            date: appointment.appointmentDate, // Use appointmentDate as date
            appointmentTime: appointment.appointmentTime,
            patientName: appointment.patientName,
            type: appointment.type || 'Consultation',
            duration: `${appointment.duration || 30} min`,
            status: appointment.status || 'pending',
            notes: appointment.reason || '',
          };

          try {
            // Call scheduleAppointmentReminder with the appointment object as first parameter
            notificationService.scheduleAppointmentReminder(notificationAppointment, 30);
            notificationService.scheduleAppointmentReminder(notificationAppointment, 15);
            notificationService.scheduleAppointmentReminder(notificationAppointment, 5);
          } catch (error) {
            console.error('Error scheduling notification for appointment:', appointment.id, error);
          }
        }
      });
      
      console.log('✅ Appointment notifications scheduled for professional portal');
    } catch (error) {
      console.error('Error in scheduleAppointmentNotifications:', error);
    }
  };

  // Available time slots for setting availability
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
  const [doctorAvailability, setDoctorAvailability] = useState({
    // Default availability - business hours only
    enabledHours: Array.from({length: 10}, (_, i) => i + 8), // 8 AM to 5 PM
    disabledSlots: [], // Specific time slots that are unavailable
    customAvailableSlots: [], // Custom slots outside business hours
  });

  const [showAvailabilitySettings, setShowAvailabilitySettings] = useState(false);

  // Memoize appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    if (!appointments.length) return [];
    
    return appointments.filter(apt => {
      return AppointmentService.isSameDay(apt.appointmentDate, selectedDate);
    });
  }, [selectedDate, appointments]);

  // Memoize marked dates
  const markedDates = useMemo(() => {
    const marked = {};
    console.log('👨‍⚕️ Computing marked dates for appointments:', appointments.length);
    
    appointments.forEach(apt => {
      const date = AppointmentService.getDateString(apt.appointmentDate);
      if (date) {
        console.log(`👨‍⚕️ Marking date ${date} for appointment ${apt.id}`);
        marked[date] = {
          marked: true,
          dotColor: '#4A90E2',
        };
      }
    });
    
    console.log('👨‍⚕️ Final marked dates:', Object.keys(marked));
    return marked;
  }, [appointments]);

  // Toggle calendar visibility
  const toggleCalendar = useCallback(() => {
    const toValue = isCalendarExpanded ? 120 : 350; // Collapsed vs expanded height
    setIsCalendarExpanded(!isCalendarExpanded);
    
    Animated.timing(calendarHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isCalendarExpanded, calendarHeight]);

  // Handle date selection
  const onCalendarDayPress = useCallback((dateId) => {
    if (dateId && typeof dateId === 'string') {
      setSelectedDate(dateId);
    }
  }, []);

  // Appointment type styling
  const getTypeColor = useCallback((type) => {
    switch (type.toLowerCase()) {
      case 'video call':
        return '#4A90E2';
      case 'in-person':
        return '#28a745';
      case 'chat':
        return '#6c757d';
      case 'follow-up':
        return '#17a2b8';
      case 'check-up':
        return '#fd7e14';
      case 'new patient':
        return '#6f42c1';
      case 'emergency consultation':
        return '#dc3545';
      default:
        return '#4A90E2';
    }
  }, []);

  const getTypeIcon = useCallback((type) => {
    switch (type.toLowerCase()) {
      case 'video call':
        return 'videocam';
      case 'in-person':
        return 'person';
      case 'chat':
        return 'chatbubble';
      case 'follow-up':
        return 'refresh';
      case 'check-up':
        return 'medical';
      case 'new patient':
        return 'person-add';
      case 'emergency consultation':
        return 'alert-circle';
      default:
        return 'calendar';
    }
  }, []);

  // Handle appointment press with direct navigation to details
  const handleAppointmentPress = useCallback((appointment) => {
    navigation.navigate('AppointmentDetails', { appointmentId: appointment.id });
  }, [navigation]);

  // Render appointment item
  const renderAppointmentItem = useCallback((item, index) => {
    const typeColor = getTypeColor(item.type);
    const typeIcon = getTypeIcon(item.type);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.appointmentItem, { borderLeftColor: typeColor }]}
        onPress={() => handleAppointmentPress(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{item.appointmentTime}</Text>
          </View>
          <View style={[styles.typeIcon, { backgroundColor: typeColor }]}>
            <Ionicons name={typeIcon} size={16} color="white" />
          </View>
        </View>
        <Text style={styles.patientName}>{item.patientName}</Text>
        <Text style={styles.appointmentReason}>{item.reason}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.appointmentType}>{item.type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#4caf50' }]}
              onPress={() => handleStatusUpdate(item.id, 'confirmed', 'Appointment confirmed by doctor')}
            >
              <Text style={styles.actionButtonText}>Accept</Text>
            </TouchableOpacity>
          )}
          {item.status === 'pending' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#ff9800' }]}
              onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
            >
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
          )}
          {item.status !== 'cancelled' && item.status !== 'completed' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#f44336' }]}
              onPress={() => handleCancelAppointment(item)}
            >
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {item.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#2196f3' }]}
              onPress={() => handleStatusUpdate(item.id, 'completed', 'Consultation completed')}
            >
              <Text style={styles.actionButtonText}>Complete</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [getTypeColor, getTypeIcon, handleAppointmentPress, handleStatusUpdate, handleCancelAppointment, navigation]);

  // Format date display
  const formatDateDisplay = useCallback((dateString) => {
    try {
      if (!dateString || typeof dateString !== 'string') {
        return 'Invalid Date';
      }
      
      const date = new Date(dateString);
      
      // Check if date is valid
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
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  }, []);

  const handleAddAvailability = () => {
    setShowAvailabilityModal(true);
    setAvailabilityDate('');
    setSelectedTimeSlots([]);
  };

  const handleTimeSlotToggle = (timeSlot) => {
    setSelectedTimeSlots(prev => {
      if (prev.includes(timeSlot)) {
        return prev.filter(slot => slot !== timeSlot);
      } else {
        return [...prev, timeSlot];
      }
    });
  };

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

  // Toggle hour availability
  const toggleHourAvailability = (hour) => {
    setDoctorAvailability(prev => ({
      ...prev,
      enabledHours: prev.enabledHours.includes(hour)
        ? prev.enabledHours.filter(h => h !== hour)
        : [...prev.enabledHours, hour].sort((a, b) => a - b)
    }));
  };

  // Toggle specific time slot
  const toggleSpecificTimeSlot = (timeKey, hour) => {
    setDoctorAvailability(prev => {
      const isHourEnabled = prev.enabledHours.includes(hour);
      
      if (isHourEnabled) {
        // If hour is enabled, add to disabled slots
        return {
          ...prev,
          disabledSlots: prev.disabledSlots.includes(timeKey)
            ? prev.disabledSlots.filter(slot => slot !== timeKey)
            : [...prev.disabledSlots, timeKey]
        };
      } else {
        // If hour is disabled, add to custom available slots
        return {
          ...prev,
          customAvailableSlots: prev.customAvailableSlots.includes(timeKey)
            ? prev.customAvailableSlots.filter(slot => slot !== timeKey)
            : [...prev.customAvailableSlots, timeKey]
        };
      }
    });
  };

  const handleOpenAvailabilitySettings = () => {
    setShowAvailabilitySettings(true);
  };

  const handleSaveAvailability = () => {
    if (!availabilityDate || selectedTimeSlots.length === 0) {
      Alert.alert('Error', 'Please select a date and at least one time slot.');
      return;
    }

    Alert.alert(
      'Availability Added',
      `You are now available on ${availabilityDate} for the following time slots:\n${selectedTimeSlots.join(', ')}`,
      [
        {
          text: 'OK',
          onPress: () => {
            setShowAvailabilityModal(false);
            // In a real app, this would save to backend/database
          }
        }
      ]
    );
  };

  const handleOpenMessages = () => {
    navigation.navigate('ChatListScreen');
  };

  // Debug function to reset data
  const handleResetData = async () => {
    try {
      Alert.alert(
        'Reset Data',
        'This will clear all appointment data and reinitialize. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            style: 'destructive',
            onPress: async () => {
              await AppointmentService.clearAndReinitialize();
              await loadAppointments();
              Alert.alert('Success', 'Data reset successfully');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error resetting data:', error);
      Alert.alert('Error', 'Failed to reset data');
    }
  };

  // Debug function to test synchronization
  const handleTestSync = async () => {
    try {
      console.log('🔍 Starting comprehensive sync test...');
      await AppointmentService.testComprehensiveSync();
      Alert.alert('Sync Test', 'Comprehensive sync test completed. Check console for details.');
    } catch (error) {
      console.error('Error testing sync:', error);
      Alert.alert('Error', 'Failed to run sync test');
    }
  };

  // Test backend connectivity
  const handleTestBackend = async () => {
    try {
      console.log('🌐 Testing backend connectivity...');
      const isConnected = await BackendService.testConnection();
      if (isConnected) {
        Alert.alert('Backend Status', '✅ Backend is connected and available');
      } else {
        Alert.alert('Backend Status', '❌ Backend is not available');
      }
    } catch (error) {
      console.error('Backend test error:', error);
      Alert.alert('Backend Status', `❌ Backend test failed: ${error.message}`);
    }
  };

  // Sync data with backend
  const handleSyncWithBackend = async () => {
    try {
      console.log('🔄 Syncing data with backend...');
      const result = await BackendService.syncData();
      Alert.alert('Sync Complete', `✅ Synced ${result.appointments.length} appointments and ${result.notifications.length} notifications`);
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Failed', `❌ Sync failed: ${error.message}`);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      case 'completed':
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.settingsButton} onPress={handleOpenAvailabilitySettings}>
            <Ionicons name="settings" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.messageButton} onPress={handleOpenMessages}>
            <Ionicons name="chatbubbles" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAvailability}>
            <Ionicons name="add" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={handleResetData}>
            <Ionicons name="refresh" size={24} color="#dc3545" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={handleTestSync}>
            <Ionicons name="sync" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={handleTestBackend}>
            <Ionicons name="link" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={handleSyncWithBackend}>
            <Ionicons name="cloud-upload" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Section */}
      <Animated.View style={[styles.calendarContainer, { height: calendarHeight }]}>
        <SimpleCalendar
          key={`calendar-${Object.keys(markedDates).join('-')}`} // Force re-render when dates change
          selectedDate={selectedDate}
          onDatePress={onCalendarDayPress}
          markedDates={markedDates}
        />
        
        {/* Calendar Toggle Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleCalendar}>
          <View style={styles.knob} />
          <Ionicons 
            name={isCalendarExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#4A90E2" 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Appointments List Section */}
      <View style={styles.appointmentsSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>
            {formatDateDisplay(selectedDate)}
          </Text>
          <Text style={styles.appointmentCount}>
            {selectedDateAppointments.length} appointment{selectedDateAppointments.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <ScrollView 
          style={styles.appointmentsList}
          contentContainerStyle={styles.appointmentsContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {selectedDateAppointments.length > 0 ? (
            selectedDateAppointments.map((item, index) => renderAppointmentItem(item, index))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#E9ECEF" />
              <Text style={styles.emptyTitle}>No appointments</Text>
              <Text style={styles.emptySubtitle}>No appointments scheduled for this date</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleAddAvailability}>
          <Text style={styles.actionButtonText}>Add Availability</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Sync with Institution</Text>
        </TouchableOpacity>
      </View>

      {/* Availability Modal */}
      <Modal
        visible={showAvailabilityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAvailabilityModal(false)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Availability</Text>
            <TouchableOpacity onPress={handleSaveAvailability}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Select Date</Text>
            <SimpleCalendar
              key={`modal-calendar-${Object.keys(markedDates).join('-')}`} // Force re-render when dates change
              selectedDate={availabilityDate}
              onDatePress={(dateId) => {
                if (dateId && typeof dateId === 'string') {
                  setAvailabilityDate(dateId);
                }
              }}
              markedDates={markedDates}
            />

            <Text style={styles.modalSectionTitle}>Select Available Time Slots</Text>
            <Text style={styles.modalSubtitle}>Tap to select/deselect time slots when you're available</Text>
            
            <View style={styles.timeSlotsGrid}>
              {getAvailableTimeSlots().map((timeSlot) => {
                const isSelected = selectedTimeSlots.includes(timeSlot.time24);
                const isBusinessHours = timeSlot.isBusinessHours;
                
                return (
                  <TouchableOpacity
                    key={timeSlot.time24}
                    style={[
                      styles.timeSlotButton,
                      isSelected && styles.selectedTimeSlotButton,
                      !isBusinessHours && styles.afterHoursSlotButton,
                    ]}
                    onPress={() => handleTimeSlotToggle(timeSlot.time24)}
                  >
                    <Text style={[
                      styles.timeSlotButtonText,
                      isSelected && styles.selectedTimeSlotButtonText,
                      !isBusinessHours && styles.afterHoursSlotText,
                    ]}>
                      {timeSlot.time12}
                    </Text>
                    {!isBusinessHours && (
                      <Text style={styles.afterHoursLabel}>After Hours</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {selectedTimeSlots.length > 0 && (
              <View style={styles.selectedSlotsContainer}>
                <Text style={styles.selectedSlotsTitle}>
                  Selected: {selectedTimeSlots.length} time slot{selectedTimeSlots.length !== 1 ? 's' : ''}
                </Text>
                <Text style={styles.selectedSlotsList}>
                  {selectedTimeSlots.join(', ')}
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Availability Settings Modal */}
      <Modal
        visible={showAvailabilitySettings}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAvailabilitySettings(false)}>
              <Text style={styles.modalCancelText}>Done</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Availability Settings</Text>
            <TouchableOpacity onPress={() => {
              // Reset to default business hours
              setDoctorAvailability({
                enabledHours: Array.from({length: 10}, (_, i) => i + 8),
                disabledSlots: [],
                customAvailableSlots: [],
              });
            }}>
              <Text style={styles.modalSaveText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSectionTitle}>Working Hours</Text>
            <Text style={styles.modalSubtitle}>Enable/disable entire hours. Green = enabled, Gray = disabled</Text>
            
            <View style={styles.hoursGrid}>
              {Array.from({length: 24}, (_, hour) => {
                const isEnabled = doctorAvailability.enabledHours.includes(hour);
                const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                const period = hour < 12 ? 'AM' : 'PM';
                const timeLabel = `${hour12} ${period}`;
                
                return (
                  <TouchableOpacity
                    key={hour}
                    style={[
                      styles.hourButton,
                      isEnabled && styles.enabledHourButton,
                    ]}
                    onPress={() => toggleHourAvailability(hour)}
                  >
                    <Text style={[
                      styles.hourButtonText,
                      isEnabled && styles.enabledHourButtonText,
                    ]}>
                      {timeLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.modalSectionTitle}>Fine-tune Time Slots</Text>
            <Text style={styles.modalSubtitle}>
              Customize specific 30-minute slots. For enabled hours: tap to disable specific slots. 
              For disabled hours: tap to enable specific slots.
            </Text>
            
            <View style={styles.timeSlotsList}>
              {timeSlots.map((timeSlot) => {
                const { hour, time24, time12 } = timeSlot;
                const isHourEnabled = doctorAvailability.enabledHours.includes(hour);
                const isSlotDisabled = doctorAvailability.disabledSlots.includes(time24);
                const isSlotCustomEnabled = doctorAvailability.customAvailableSlots.includes(time24);
                
                let slotStatus = 'unavailable';
                let statusColor = '#ADB5BD';
                let statusText = 'Unavailable';
                
                if (isHourEnabled && !isSlotDisabled) {
                  slotStatus = 'available';
                  statusColor = '#28a745';
                  statusText = 'Available';
                } else if (!isHourEnabled && isSlotCustomEnabled) {
                  slotStatus = 'custom';
                  statusColor = '#4A90E2';
                  statusText = 'Custom Available';
                } else if (isHourEnabled && isSlotDisabled) {
                  slotStatus = 'disabled';
                  statusColor = '#dc3545';
                  statusText = 'Disabled';
                }
                
                return (
                  <TouchableOpacity
                    key={time24}
                    style={[styles.timeSlotRow, { borderLeftColor: statusColor }]}
                    onPress={() => toggleSpecificTimeSlot(time24, hour)}
                  >
                    <View style={styles.timeSlotInfo}>
                      <Text style={styles.timeSlotTime}>{time12}</Text>
                      <Text style={[styles.timeSlotStatus, { color: statusColor }]}>
                        {statusText}
                      </Text>
                    </View>
                    <Ionicons 
                      name={slotStatus === 'available' || slotStatus === 'custom' ? "checkmark-circle" : "close-circle"} 
                      size={24} 
                      color={statusColor} 
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.availabilitySummary}>
              <Text style={styles.summaryTitle}>Summary</Text>
              <Text style={styles.summaryText}>
                Enabled Hours: {doctorAvailability.enabledHours.length}/24
              </Text>
              <Text style={styles.summaryText}>
                Disabled Slots: {doctorAvailability.disabledSlots.length}
              </Text>
              <Text style={styles.summaryText}>
                Custom Available Slots: {doctorAvailability.customAvailableSlots.length}
              </Text>
              <Text style={styles.summaryText}>
                Total Available Slots: {getAvailableTimeSlots().length}
              </Text>
            </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 8,
  },
  messageButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
  },
  debugButton: {
    padding: 8,
    marginLeft: 8,
  },
  appointmentsSection: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listHeader: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  appointmentCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentsContent: {
    padding: 20,
    flexGrow: 1,
  },
  appointmentItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  appointmentReason: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentType: {
    fontSize: 14,
    color: '#566573',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
  },
  bottomActions: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  actionButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
    marginBottom: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButtonText: {
    color: '#4A90E2',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    marginTop: 20,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 15,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlotButton: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedTimeSlotButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  timeSlotButtonText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  selectedTimeSlotButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectedSlotsContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  selectedSlotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  selectedSlotsList: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  calendarArrow: {
    padding: 8,
  },
  weekDaysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
    textAlign: 'center',
    width: 40,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#4A90E2',
  },
  todayDay: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  dayText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  todayDayText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  appointmentDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fd7e14',
  },
  toggleButton: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  knob: {
    width: 40,
    height: 4,
    backgroundColor: '#4A90E2',
    borderRadius: 2,
    marginBottom: 4,
  },
  afterHoursSlotButton: {
    backgroundColor: '#E9ECEF',
    borderColor: '#E9ECEF',
  },
  afterHoursSlotText: {
    color: '#7F8C8D',
  },
  afterHoursLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  hoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hourButton: {
    width: '30%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  enabledHourButton: {
    backgroundColor: '#28a745',
    borderColor: '#28a745',
  },
  hourButtonText: {
    fontSize: 14,
    color: '#2C3E50',
  },
  enabledHourButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeSlotsList: {
    flex: 1,
  },
  timeSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E9ECEF',
  },
  timeSlotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeSlotTime: {
    fontSize: 14,
    color: '#2C3E50',
  },
  timeSlotStatus: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  availabilitySummary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default DoctorAppointmentsScreen;