import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, Agenda } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

// Mock data for appointments - replace/expand later
const mockAppointments = {
  '2025-07-28': [
    { time: '09:00 AM', patient: 'Judith Scoft', type: 'Follow-up', duration: '30 mins', id:'app1' },
    { time: '10:00 AM', patient: 'Samuel Cole', type: 'New Patient', duration: '45 mins', id:'app2' },
  ],
  '2025-07-29': [
    { time: '11:00 AM', patient: 'Rose Nguyen', type: 'Check-up', duration: '30 mins', id:'app3' },
  ],
  // Add more dates and appointments as needed
};

const DoctorAppointmentsScreen = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Today's date in YYYY-MM-DD format
  const [items, setItems] = useState({});

  // Function to format dates for the Agenda component
  const timeToString = (time) => {
    const date = new Date(time);
    return date.toISOString().split('T')[0];
  };

  // Load items for Agenda
  // This is a simplified version; you might fetch this from a service
  const loadItems = (day) => {
    // setTimeout(() => { // Simulate API call
      const newItems = {};
      for (let i = -15; i < 85; i++) {
        const time = day.timestamp + i * 24 * 60 * 60 * 1000;
        const strTime = timeToString(time);
        if (!newItems[strTime]) {
          newItems[strTime] = [];
          const dayAppointments = mockAppointments[strTime];
          if (dayAppointments) {
            newItems[strTime].push(...dayAppointments.map(app => ({...app, day: strTime, height: Math.max(50, Math.floor(Math.random() * 150))})));
          }
        }
      }
      setItems(newItems);
    // }, 1000);
  };


  const renderItem = (item, isFirst) => {
    return (
      <TouchableOpacity 
        style={styles.itemContainer}
        onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
      >
        <Text style={styles.itemTime}>{item.time}</Text>
        <Text style={styles.itemPatient}>{item.patient}</Text>
        <Text style={styles.itemType}>{item.type}</Text>
        <Text style={styles.itemDuration}>{item.duration}</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDateContainer}>
        <Text style={styles.emptyDateText}>No appointments for this day.</Text>
      </View>
    );
  };

  const rowHasChanged = (r1, r2) => {
    return r1.name !== r2.name; // Adjust based on your item structure
  };

  return (
    <SafeAreaView style={styles.container}>
      <Agenda
        items={items}
        loadItemsForMonth={loadItems}
        selected={selectedDate} // Today's date
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        rowHasChanged={rowHasChanged}
        showClosingKnob={true}
        // markingType={'period'}
        // markedDates={{ // Example for marking dates
        //    '2024-07-28': {textColor: '#43515c'},
        //    '2024-07-29': {textColor: '#43515c'},
        //    '2024-07-25': {startingDay: true, color: '#50cebb', textColor: 'white'},
        //    '2024-07-26': {color: '#70d7c7', textColor: 'white'},
        // }}
        // monthFormat={'yyyy MM'}
        theme={{
          agendaDayTextColor: '#4A90E2',
          agendaDayNumColor: '#4A90E2',
          agendaTodayColor: '#FF6347', // Tomato color for today
          agendaKnobColor: '#4A90E2',
          selectedDayBackgroundColor: '#4A90E2',
          dotColor: '#4A90E2',
          todayTextColor: '#FF6347',
          // ... other theme properties
        }}
        style={{}}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    marginTop: 17,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTime: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  itemPatient: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 3,
  },
  itemType: {
    fontSize: 14,
    color: '#566573',
    marginBottom: 3,
  },
  itemDuration: {
    fontSize: 13,
    color: '#7F8C8D',
  },
  emptyDateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyDateText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});

export default DoctorAppointmentsScreen; 