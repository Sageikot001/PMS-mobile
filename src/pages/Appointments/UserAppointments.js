import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AppointmentService, { APPOINTMENT_STATUS } from '../../services/AppointmentService';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

const UserCalendar = ({ selectedDate, onDatePress, appointmentDates = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const formatDateKey = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const hasAppointment = (date) => {
    if (!date) return false;
    const dateKey = formatDateKey(date);
    return appointmentDates.includes(dateKey);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return formatDateKey(date) === formatDateKey(selectedDate);
  };

  return (
    <View style={styles.calendar}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthText}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              date && isToday(date) && styles.todayCell,
              date && isSelected(date) && styles.selectedCell,
              date && hasAppointment(date) && styles.appointmentCell,
            ]}
            onPress={() => date && onDatePress(date)}
            disabled={!date}
          >
            {date && (
              <>
                <Text style={[
                  styles.dayText,
                  isToday(date) && styles.todayText,
                  isSelected(date) && styles.selectedText,
                ]}>
                  {date.getDate()}
                </Text>
                {hasAppointment(date) && (
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

const UserAppointments = ({ navigation }) => {
  const { user, currentRole } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [appointmentDates, setAppointmentDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Load appointments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadAppointments();
      loadNotifications();
    }, [])
  );

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const allAppointments = await AppointmentService.getMyAppointments();
      setAppointments(allAppointments);
      
      // Extract dates that have appointments
      const dates = allAppointments.map(apt => 
        new Date(apt.appointmentDate).toISOString().split('T')[0]
      );
      setAppointmentDates([...new Set(dates)]);
      
      console.log(`📅 Loaded ${allAppointments.length} appointments for ${currentRole}`);
    } catch (error) {
      console.error('Error loading appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    try {
      const userNotifications = await AppointmentService.getMyNotifications();
      setNotifications(userNotifications.filter(notif => !notif.read));
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAppointments(), loadNotifications()]);
    setRefreshing(false);
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
  };

  const handleAppointmentPress = (appointment) => {
    Alert.alert(
      'Appointment Details',
      `Doctor: ${appointment.doctorName}\nDate: ${new Date(appointment.appointmentDate).toLocaleDateString()}\nTime: ${appointment.appointmentTime}\nStatus: ${appointment.status}\nReason: ${appointment.reason}`,
      [
        { text: 'OK' },
        { 
          text: 'Cancel Appointment', 
          style: 'destructive',
          onPress: () => handleCancelAppointment(appointment)
        }
      ]
    );
  };

  const handleCancelAppointment = (appointment) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel your appointment with ${appointment.doctorName}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelAppointment(appointment.id)
        }
      ]
    );
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await AppointmentService.cancelAppointment(appointmentId, 'Cancelled by patient');
      Alert.alert('Success', 'Appointment cancelled successfully');
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  const handleJoinCall = (appointment) => {
    Alert.alert(
      'Join Call',
      'This feature will connect you with your doctor via video call.',
      [
        { text: 'Cancel' },
        { text: 'Join Call', onPress: () => console.log('Joining call...') }
      ]
    );
  };

  const getSelectedDateAppointments = () => {
    if (!selectedDate) return [];
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
      return aptDate === selectedDateStr;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED:
        return '#4caf50';
      case APPOINTMENT_STATUS.PENDING:
        return '#ff9800';
      case APPOINTMENT_STATUS.CANCELLED:
        return '#f44336';
      case APPOINTMENT_STATUS.COMPLETED:
        return '#2196f3';
      case APPOINTMENT_STATUS.RESCHEDULED:
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case APPOINTMENT_STATUS.CONFIRMED:
        return 'checkmark-circle';
      case APPOINTMENT_STATUS.PENDING:
        return 'time';
      case APPOINTMENT_STATUS.CANCELLED:
        return 'close-circle';
      case APPOINTMENT_STATUS.COMPLETED:
        return 'checkmark-done-circle';
      case APPOINTMENT_STATUS.RESCHEDULED:
        return 'calendar';
      default:
        return 'help-circle';
    }
  };

  const renderAppointmentItem = ({ item: appointment }) => (
    <TouchableOpacity 
      style={styles.appointmentItem}
      onPress={() => handleAppointmentPress(appointment)}
    >
      <View style={styles.appointmentHeader}>
        <View style={styles.appointmentTime}>
          <Text style={styles.timeText}>{appointment.appointmentTime}</Text>
          <Text style={styles.durationText}>{appointment.duration} min</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
          <Ionicons 
            name={getStatusIcon(appointment.status)} 
            size={16} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{appointment.status}</Text>
        </View>
      </View>
      
      <View style={styles.appointmentInfo}>
        <Text style={styles.doctorName}>{appointment.doctorName}</Text>
        <Text style={styles.specialty}>{appointment.doctorSpecialty}</Text>
        <Text style={styles.reason}>{appointment.reason}</Text>
      </View>

      <View style={styles.appointmentActions}>
        {appointment.status === APPOINTMENT_STATUS.CONFIRMED && (
          <TouchableOpacity 
            style={styles.joinCallButton}
            onPress={() => handleJoinCall(appointment)}
          >
            <Ionicons name="videocam" size={16} color="#fff" />
            <Text style={styles.joinCallText}>Join Call</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item: notification }) => (
    <TouchableOpacity 
      style={styles.notificationItem}
      onPress={() => AppointmentService.markNotificationAsRead(notification.id)}
    >
      <View style={styles.notificationIcon}>
        <Ionicons name="notifications" size={20} color="#007bff" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationBody}>{notification.body}</Text>
        <Text style={styles.notificationTime}>
          {new Date(notification.timestamp).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const selectedDateAppointments = getSelectedDateAppointments();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('ConsultationHome')}>
          <Ionicons name="add" size={24} color="#007bff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <>
            {/* Notifications */}
            {notifications.length > 0 && (
              <View style={styles.notificationsSection}>
                <Text style={styles.sectionTitle}>Recent Updates</Text>
                <FlatList
                  data={notifications}
                  renderItem={renderNotificationItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Calendar */}
            <UserCalendar
              selectedDate={selectedDate}
              onDatePress={handleDatePress}
              appointmentDates={appointmentDates}
            />

            {/* Selected Date Appointments */}
            <View style={styles.appointmentsSection}>
              <Text style={styles.sectionTitle}>
                {selectedDate.toDateString() === new Date().toDateString() 
                  ? 'Today\'s Appointments' 
                  : `Appointments for ${selectedDate.toLocaleDateString()}`}
              </Text>
              
              {selectedDateAppointments.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyStateText}>No appointments for this date</Text>
                  <TouchableOpacity 
                    style={styles.bookButton}
                    onPress={() => navigation.navigate('ConsultationHome')}
                  >
                    <Text style={styles.bookButtonText}>Book Appointment</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <FlatList
                  data={selectedDateAppointments}
                  renderItem={renderAppointmentItem}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              )}
            </View>
          </>
        )}
        keyExtractor={(item) => item.key}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  notificationsSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  calendar: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: (width - 64) / 7,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 64) / 7,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 20,
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#e3f2fd',
  },
  selectedCell: {
    backgroundColor: '#007bff',
  },
  appointmentCell: {
    backgroundColor: '#fff3e0',
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  todayText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  appointmentDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007bff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  appointmentsSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentTime: {
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  appointmentInfo: {
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#007bff',
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    color: '#666',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  joinCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  joinCallText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  bookButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UserAppointments; 