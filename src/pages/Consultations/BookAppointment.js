import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BookAppointment = ({ route, navigation }) => {
  const { provider } = route.params;
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  const [reason, setReason] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Generate time slots from 9 AM to 5 PM
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const isBooked = checkIfTimeIsBooked(selectedDate, time);
      slots.push({ time, isBooked });
    }
    return slots;
  };

  const checkIfTimeIsBooked = (date, time) => {
    // This would normally check against your bookings database
    // For now, let's simulate some random bookings
    return Math.random() < 0.3; // 30% chance of being booked
  };

  const toggleHourSelection = (time) => {
    if (selectedHours.includes(time)) {
      setSelectedHours(selectedHours.filter(t => t !== time));
    } else {
      // Only add if it's consecutive with existing selections
      const hour = parseInt(time.split(':')[0]);
      const existingHours = selectedHours.map(t => parseInt(t.split(':')[0]));
      
      if (existingHours.length === 0 || 
          existingHours.includes(hour - 1) || 
          existingHours.includes(hour + 1)) {
        setSelectedHours([...selectedHours, time].sort());
      }
    }
  };

  const calculateTotalCost = () => {
    return selectedHours.length * provider.hourlyRate;
  };

  const renderAvailableSlots = () => {
    const today = new Date();
    const availableDates = [];
    
    // Generate next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (provider.availability[getDayName(date).toLowerCase()]) {
        availableDates.push(date);
      }
    }

    return (
      <View style={styles.slotsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.datesScroll}
        >
          {availableDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateCard,
                selectedDate?.toDateString() === date.toDateString() && styles.selectedDate
              ]}
              onPress={() => {
                setSelectedDate(date);
                setSelectedHours([]);
              }}
            >
              <Text style={[
                styles.dateDay,
                selectedDate?.toDateString() === date.toDateString() && styles.selectedDateText
              ]}>
                {getDayName(date).slice(0, 3)}
              </Text>
              <Text style={[
                styles.dateNumber,
                selectedDate?.toDateString() === date.toDateString() && styles.selectedDateText
              ]}>
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedDate && (
          <View style={styles.timeSlots}>
            <Text style={styles.timeSlotsTitle}>Available Hours</Text>
            <View style={styles.timeSlotsGrid}>
              {generateTimeSlots().map(({ time, isBooked }, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    selectedHours.includes(time) && styles.selectedTimeSlot,
                    isBooked && styles.bookedTimeSlot
                  ]}
                  onPress={() => !isBooked && toggleHourSelection(time)}
                  disabled={isBooked}
                >
                  <Text style={[
                    styles.timeSlotText,
                    selectedHours.includes(time) && styles.selectedTimeSlotText,
                    isBooked && styles.bookedTimeSlotText
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Appointment</Text>
        </View>

        <View style={styles.providerInfo}>
          <View style={styles.imagePlaceholder}>
            <Ionicons 
              name={provider.type === 'pharmacist' ? 'medical' : 'medical-outline'} 
              size={30} 
              color="#7E3AF2"
            />
          </View>
          <View style={styles.providerDetails}>
            <Text style={styles.providerName}>{provider.name}</Text>
            <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
          </View>
        </View>

        {renderAvailableSlots()}

        {selectedHours.length > 0 && (
          <View style={styles.costSummary}>
            <Text style={styles.costText}>
              Total Cost: ₦{calculateTotalCost()} 
              ({selectedHours.length} {selectedHours.length === 1 ? 'hour' : 'hours'})
            </Text>
          </View>
        )}

        <View style={styles.formSection}>
          <Text style={styles.formLabel}>Reason for contact</Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="Brief description of your concern"
          />

          <Text style={styles.formLabel}>Additional information</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={additionalInfo}
            onChangeText={setAdditionalInfo}
            placeholder="Any other details you'd like to share"
            multiline
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            (!selectedDate || selectedHours.length === 0) && styles.disabledButton
          ]}
          disabled={!selectedDate || selectedHours.length === 0}
          onPress={() => navigation.navigate('AppointmentConfirmation', {
            provider,
            appointmentDate: selectedDate,
            appointmentHours: selectedHours,
            reason,
            additionalInfo,
            totalCost: calculateTotalCost()
          })}
        >
          <Text style={styles.confirmButtonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  providerSpecialty: {
    fontSize: 14,
    color: '#666',
  },
  slotsContainer: {
    padding: 16,
  },
  datesScroll: {
    marginBottom: 24,
  },
  dateCard: {
    width: 70,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDate: {
    backgroundColor: '#7E3AF2',
  },
  dateDay: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  selectedDateText: {
    color: '#fff',
  },
  timeSlots: {
    marginTop: 16,
  },
  timeSlotsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  selectedTimeSlot: {
    backgroundColor: '#7E3AF2',
  },
  timeSlotText: {
    color: '#333',
  },
  selectedTimeSlotText: {
    color: '#fff',
  },
  formSection: {
    padding: 16,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#7E3AF2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookedTimeSlot: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  bookedTimeSlotText: {
    color: '#999',
  },
  costSummary: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginTop: 16,
  },
  costText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
});

export default BookAppointment; 