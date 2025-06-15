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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import notificationService from '../../services/NotificationService';

const { height: screenHeight } = Dimensions.get('window');

// Mock data for appointments - replace/expand later
const mockAppointments = {
  // Today's appointments
  '2025-06-15': [
    { time: '09:00 AM', patient: 'Judith Scoft', type: 'Follow-up', duration: '30 mins', id:'app1' },
    { time: '10:00 AM', patient: 'Samuel Cole', type: 'New Patient', duration: '45 mins', id:'app2' },
    { time: '02:00 PM', patient: 'Emma Thompson', type: 'Video Call', duration: '30 mins', id:'app15' },
  ],
  // Tomorrow's appointments
  '2025-06-16': [
    { time: '08:30 AM', patient: 'Rose Nguyen', type: 'Check-up', duration: '30 mins', id:'app3' },
    { time: '10:00 AM', patient: 'Megan Reed', type: 'In-Person', duration: '45 mins', id:'app4' },
    { time: '11:30 AM', patient: 'Alex Parker', type: 'Follow-up', duration: '30 mins', id:'app16' },
    { time: '02:00 PM', patient: 'Sarah Johnson', type: 'Video Call', duration: '30 mins', id:'app17' },
    { time: '03:30 PM', patient: 'Michael Chen', type: 'Chat', duration: '15 mins', id:'app18' },
  ],
  // Day after tomorrow
  '2025-06-17': [
    { time: '09:00 AM', patient: 'David Wilson', type: 'New Patient', duration: '60 mins', id:'app19' },
    { time: '11:00 AM', patient: 'Lisa Brown', type: 'Check-up', duration: '30 mins', id:'app20' },
    { time: '01:00 PM', patient: 'Tom Anderson', type: 'In-Person', duration: '45 mins', id:'app21' },
  ],
  // Next week - Monday
  '2025-06-20': [
    { time: '08:00 AM', patient: 'Jennifer Davis', type: 'Video Call', duration: '30 mins', id:'app22' },
    { time: '09:30 AM', patient: 'Robert Taylor', type: 'Follow-up', duration: '30 mins', id:'app23' },
    { time: '11:00 AM', patient: 'Emily White', type: 'Check-up', duration: '30 mins', id:'app24' },
    { time: '02:30 PM', patient: 'James Miller', type: 'In-Person', duration: '45 mins', id:'app25' },
  ],
  // Next week - Tuesday
  '2025-06-21': [
    { time: '08:00 AM', patient: 'Kyle Carson', type: 'Video Call', duration: '30 mins', id:'app5' },
    { time: '10:00 AM', patient: 'Anna Martinez', type: 'New Patient', duration: '60 mins', id:'app26' },
    { time: '11:00 AM', patient: 'Chat Follow-up', type: 'Chat', duration: '15 mins', id:'app6' },
    { time: '01:30 PM', patient: 'Carlos Rodriguez', type: 'Check-up', duration: '30 mins', id:'app27' },
    { time: '03:00 PM', patient: 'Patricia Garcia', type: 'Follow-up', duration: '30 mins', id:'app28' },
  ],
  // Next week - Wednesday
  '2025-06-22': [
    { time: '09:00 AM', patient: 'Christopher Lee', type: 'In-Person', duration: '45 mins', id:'app29' },
    { time: '11:00 AM', patient: 'Amanda Clark', type: 'Video Call', duration: '30 mins', id:'app30' },
    { time: '02:00 PM', patient: 'Daniel Lewis', type: 'Check-up', duration: '30 mins', id:'app31' },
  ],
  // Next week - Friday
  '2025-06-24': [
    { time: '08:30 AM', patient: 'Nicole Walker', type: 'Follow-up', duration: '30 mins', id:'app32' },
    { time: '10:00 AM', patient: 'Brian Hall', type: 'New Patient', duration: '60 mins', id:'app33' },
    { time: '01:00 PM', patient: 'Rachel Allen', type: 'Video Call', duration: '30 mins', id:'app34' },
    { time: '02:30 PM', patient: 'Kevin Young', type: 'In-Person', duration: '45 mins', id:'app35' },
    { time: '04:00 PM', patient: 'Stephanie King', type: 'Chat', duration: '15 mins', id:'app36' },
  ],
  // Next weekend - Saturday
  '2025-06-25': [
    { time: '10:00 AM', patient: 'Mark Wright', type: 'Emergency Consultation', duration: '30 mins', id:'app37' },
    { time: '11:30 AM', patient: 'Laura Scott', type: 'Video Call', duration: '30 mins', id:'app38' },
  ],
  // Following week - Monday
  '2025-06-27': [
    { time: '09:00 AM', patient: 'Paul Green', type: 'Check-up', duration: '30 mins', id:'app39' },
    { time: '10:30 AM', patient: 'Michelle Adams', type: 'Follow-up', duration: '30 mins', id:'app40' },
    { time: '02:00 PM', patient: 'Steven Baker', type: 'New Patient', duration: '60 mins', id:'app41' },
    { time: '03:30 PM', patient: 'Kimberly Nelson', type: 'In-Person', duration: '45 mins', id:'app42' },
  ],
};

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

  // Initialize notification service when component mounts
  useEffect(() => {
    initializeAndScheduleNotifications();
  }, []);

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

      // Convert mock appointments to the format expected by notification service
      Object.entries(mockAppointments).forEach(([dateStr, appointments]) => {
        // Validate dateStr
        if (!dateStr || typeof dateStr !== 'string') {
          console.warn('Invalid date string:', dateStr);
          return;
        }

        appointments.forEach(appointment => {
          // Validate appointment data
          if (!appointment || !appointment.id || !appointment.time || !appointment.patient) {
            console.warn('Invalid appointment data:', appointment);
            return;
          }

          const appointmentData = {
            id: appointment.id,
            date: dateStr,
            time: appointment.time,
            patient: appointment.patient,
            type: appointment.type || 'Appointment',
            duration: appointment.duration || '30 mins'
          };
          
          // Schedule multiple reminders (30 min, 15 min, 5 min before)
          try {
            notificationService.scheduleAppointmentReminder(appointmentData, 30);
            notificationService.scheduleAppointmentReminder(appointmentData, 15);
            notificationService.scheduleAppointmentReminder(appointmentData, 5);
          } catch (reminderError) {
            console.error('Error scheduling reminder for appointment:', appointmentData.id, reminderError);
          }
        });
      });
    } catch (error) {
      console.error('Error in scheduleAppointmentNotifications:', error);
    }
  };

  // Available time slots for setting availability
  const timeSlots = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM',
    '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM',
    '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  // Memoize appointments for selected date
  const selectedDateAppointments = useMemo(() => {
    return mockAppointments[selectedDate] || [];
  }, [selectedDate]);

  // Memoize marked dates
  const markedDates = useMemo(() => {
    const marked = {};
    Object.keys(mockAppointments).forEach(date => {
      marked[date] = {
        marked: true,
        dotColor: '#4A90E2',
      };
    });
    
    // Add selection to current date
    marked[selectedDate] = {
      ...marked[selectedDate],
      selected: true,
      selectedColor: '#4A90E2',
      selectedTextColor: '#ffffff'
    };
    
    return marked;
  }, [selectedDate]);

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

    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.appointmentItem, { borderLeftColor: typeColor }]}
        onPress={() => handleAppointmentPress(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{item.time}</Text>
          </View>
          <View style={[styles.typeIcon, { backgroundColor: typeColor }]}>
            <Ionicons name={typeIcon} size={16} color="white" />
          </View>
        </View>
        <Text style={styles.patientName}>{item.patient}</Text>
        <View style={styles.itemFooter}>
          <Text style={styles.appointmentType}>{item.type}</Text>
          <Text style={styles.duration}>{item.duration}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [getTypeColor, getTypeIcon, handleAppointmentPress]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Appointments</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.messageButton} onPress={handleOpenMessages}>
            <Ionicons name="chatbubbles" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={handleAddAvailability}>
            <Ionicons name="add" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Section */}
      <Animated.View style={[styles.calendarContainer, { height: calendarHeight }]}>
        <SimpleCalendar
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
              {timeSlots.map((timeSlot) => (
                <TouchableOpacity
                  key={timeSlot}
                  style={[
                    styles.timeSlotButton,
                    selectedTimeSlots.includes(timeSlot) && styles.selectedTimeSlotButton
                  ]}
                  onPress={() => handleTimeSlotToggle(timeSlot)}
                >
                  <Text style={[
                    styles.timeSlotButtonText,
                    selectedTimeSlots.includes(timeSlot) && styles.selectedTimeSlotButtonText
                  ]}>
                    {timeSlot}
                  </Text>
                </TouchableOpacity>
              ))}
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
  messageButton: {
    padding: 8,
    marginRight: 8,
  },
  addButton: {
    padding: 8,
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
  duration: {
    fontSize: 12,
    color: '#7F8C8D',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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
});

export default DoctorAppointmentsScreen; 