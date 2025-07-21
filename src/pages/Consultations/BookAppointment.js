import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AppointmentService, { APPOINTMENT_TYPES } from '../../services/AppointmentService';

const BookAppointment = ({ route, navigation }) => {
  const { provider } = route.params;
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [appointmentType, setAppointmentType] = useState(APPOINTMENT_TYPES.CONSULTATION);
  const [isBooking, setIsBooking] = useState(false);

  // Available time slots for Dr. John Smith
  const availableTimeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  // Generate next 30 days for booking
  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      // Exclude weekends for Dr. John Smith
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date);
      }
    }
    
    return dates;
  };

  const availableDates = generateAvailableDates();

  // Appointment types with descriptions
  const appointmentTypes = [
    {
      type: APPOINTMENT_TYPES.CONSULTATION,
      title: 'Consultation',
      description: 'General medical consultation',
      icon: 'medical',
      duration: 30,
    },
    {
      type: APPOINTMENT_TYPES.FOLLOW_UP,
      title: 'Follow-up',
      description: 'Follow-up on previous treatment',
      icon: 'repeat',
      duration: 20,
    },
    {
      type: APPOINTMENT_TYPES.VIDEO_CALL,
      title: 'Video Call',
      description: 'Remote video consultation',
      icon: 'videocam',
      duration: 25,
    },
    {
      type: APPOINTMENT_TYPES.EMERGENCY,
      title: 'Urgent',
      description: 'Urgent medical consultation',
      icon: 'alert-circle',
      duration: 45,
    },
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleTypeSelect = (type) => {
    setAppointmentType(type);
  };

  const calculateTotalCost = () => {
    const selectedTypeObj = appointmentTypes.find(t => t.type === appointmentType);
    const duration = selectedTypeObj?.duration || 30;
    const hourlyRate = provider.hourlyRate || 15000;
    return Math.round((duration / 60) * hourlyRate);
  };

  const validateBooking = () => {
    if (!selectedDate) {
      Alert.alert('Missing Information', 'Please select a date for your appointment');
      return false;
    }
    if (!selectedTime) {
      Alert.alert('Missing Information', 'Please select a time for your appointment');
      return false;
    }
    if (!reason.trim()) {
      Alert.alert('Missing Information', 'Please provide a reason for your appointment');
      return false;
    }
    return true;
  };

  const handleBookAppointment = async () => {
    if (!validateBooking()) return;

    setIsBooking(true);
    
    try {
      const selectedTypeObj = appointmentTypes.find(t => t.type === appointmentType);
      
      const appointmentData = {
        doctorId: provider.id,
        doctorName: provider.name,
        doctorEmail: 'ikotnsikak@gmail.com',
        doctorSpecialty: provider.specialty,
        appointmentDate: selectedDate.toISOString(),
        appointmentTime: selectedTime,
        duration: selectedTypeObj?.duration || 30,
        type: appointmentType,
        reason: reason.trim(),
        notes: additionalInfo.trim(),
        totalCost: calculateTotalCost(),
      };

      const newAppointment = await AppointmentService.createAppointment(appointmentData);
      
      Alert.alert(
        'Appointment Booked Successfully! 🎉',
        `Your appointment with ${provider.name} has been scheduled for ${selectedDate.toLocaleDateString()} at ${selectedTime}.\n\nAppointment ID: ${newAppointment.id.slice(-8).toUpperCase()}\nCost: ₦${calculateTotalCost().toLocaleString()}\n\nYou will receive a notification once the doctor confirms your appointment.`,
        [
          {
            text: 'View My Appointments',
            onPress: () => navigation.navigate('UserAppointments')
          },
          {
            text: 'Book Another',
            onPress: () => {
              setSelectedDate(null);
              setSelectedTime(null);
              setReason('');
              setAdditionalInfo('');
              setAppointmentType(APPOINTMENT_TYPES.CONSULTATION);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Booking Failed', 'Failed to book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const renderDateSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
        {availableDates.map((date, index) => {
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
    return (
            <TouchableOpacity
              key={index}
              style={[styles.dateCard, isSelected && styles.selectedDateCard]}
              onPress={() => handleDateSelect(date)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {date.toLocaleDateString('en', { weekday: 'short' })}
              </Text>
              <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                {date.getDate()}
              </Text>
              <Text style={[styles.monthText, isSelected && styles.selectedMonthText]}>
                {date.toLocaleDateString('en', { month: 'short' })}
              </Text>
            </TouchableOpacity>
          );
        })}
        </ScrollView>
    </View>
  );

  const renderTimeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Time</Text>
      <View style={styles.timeGrid}>
        {availableTimeSlots.map((time, index) => {
          const isSelected = selectedTime === time;
          return (
                <TouchableOpacity
                  key={index}
              style={[styles.timeSlot, isSelected && styles.selectedTimeSlot]}
              onPress={() => handleTimeSelect(time)}
            >
              <Text style={[styles.timeText, isSelected && styles.selectedTimeText]}>
                    {time}
                  </Text>
                </TouchableOpacity>
          );
        })}
            </View>
          </View>
  );

  const renderTypeSelector = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Appointment Type</Text>
      <View style={styles.typeGrid}>
        {appointmentTypes.map((type, index) => {
          const isSelected = appointmentType === type.type;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.typeCard, isSelected && styles.selectedTypeCard]}
              onPress={() => handleTypeSelect(type.type)}
            >
              <Ionicons 
                name={type.icon} 
                size={24} 
                color={isSelected ? '#fff' : '#007bff'} 
              />
              <Text style={[styles.typeTitle, isSelected && styles.selectedTypeTitle]}>
                {type.title}
              </Text>
              <Text style={[styles.typeDescription, isSelected && styles.selectedTypeDescription]}>
                {type.description}
              </Text>
              <Text style={[styles.typeDuration, isSelected && styles.selectedTypeDuration]}>
                {type.duration} min
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Doctor Info */}
        <View style={styles.providerInfo}>
          <View style={styles.imagePlaceholder}>
            <Ionicons 
              name="medical" 
              size={30} 
              color="#007bff"
            />
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
            <Text style={styles.providerRate}>₦{provider.hourlyRate?.toLocaleString()}/hour</Text>
          </View>
        </View>

        {/* Patient Info */}
        <View style={styles.patientInfo}>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{user?.name || 'Sageikot'}</Text>
            <Text style={styles.patientContact}>{user?.email || 'sageikot@gmail.com'}</Text>
            <Text style={styles.patientContact}>{user?.phone || '+234 803 123 4567'}</Text>
          </View>
        </View>

        {renderTypeSelector()}
        {renderDateSelector()}
        {renderTimeSelector()}

        {/* Reason Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reason for Appointment</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Brief description of your concern"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Additional Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            placeholder="Any other details you'd like to share with the doctor"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Cost Summary */}
        {selectedDate && selectedTime && (
          <View style={styles.costSummary}>
            <Text style={styles.costTitle}>Appointment Summary</Text>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Date:</Text>
              <Text style={styles.costValue}>{selectedDate.toLocaleDateString()}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Time:</Text>
              <Text style={styles.costValue}>{selectedTime}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Type:</Text>
              <Text style={styles.costValue}>
                {appointmentTypes.find(t => t.type === appointmentType)?.title}
              </Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Duration:</Text>
              <Text style={styles.costValue}>
                {appointmentTypes.find(t => t.type === appointmentType)?.duration} minutes
              </Text>
            </View>
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Cost:</Text>
              <Text style={styles.totalValue}>₦{calculateTotalCost().toLocaleString()}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime || !reason.trim() || isBooking) && styles.disabledButton
          ]}
          disabled={!selectedDate || !selectedTime || !reason.trim() || isBooking}
          onPress={handleBookAppointment}
        >
          {isBooking ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.bookButtonText}>
              Book Appointment - ₦{calculateTotalCost().toLocaleString()}
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  providerSpecialty: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 4,
  },
  providerRate: {
    fontSize: 14,
    color: '#666',
  },
  patientInfo: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  patientDetails: {
    marginTop: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  patientContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTypeCard: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  selectedTypeTitle: {
    color: '#fff',
  },
  typeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedTypeDescription: {
    color: '#e3f2fd',
  },
  typeDuration: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: 'bold',
  },
  selectedTypeDuration: {
    color: '#fff',
  },
  dateScroll: {
    paddingVertical: 8,
  },
  dateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDateCard: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  dayText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  selectedDayText: {
    color: '#e3f2fd',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedDateText: {
    color: '#fff',
  },
  monthText: {
    fontSize: 12,
    color: '#666',
  },
  selectedMonthText: {
    color: '#e3f2fd',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedTimeSlot: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedTimeText: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    textAlignVertical: 'top',
  },
  textArea: {
    minHeight: 80,
  },
  costSummary: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  costTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookAppointment; 