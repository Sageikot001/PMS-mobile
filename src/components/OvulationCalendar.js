import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const OvulationCalendar = ({ cycleData, onDateChange }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || tempDate;
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    setTempDate(currentDate);
    onDateChange && onDateChange(currentDate);
  };

  const showPicker = () => {
    setShowDatePicker(true);
  };

  const calculateDates = () => {
    const lastPeriod = new Date(cycleData.lastPeriodDate);
    const ovulationDay = new Date(lastPeriod);
    ovulationDay.setDate(lastPeriod.getDate() + cycleData.cycleLength - 14);

    const fertileWindowStart = new Date(ovulationDay);
    const fertileWindowEnd = new Date(ovulationDay);

    // Adjust fertile window based on regularity
    switch(cycleData.regularity) {
      case 'very_regular':
        fertileWindowStart.setDate(ovulationDay.getDate() - 5);
        break;
      case 'somewhat_regular':
        fertileWindowStart.setDate(ovulationDay.getDate() - 7);
        break;
      case 'irregular':
        fertileWindowStart.setDate(ovulationDay.getDate() - 9);
        break;
    }

    return {
      ovulation: ovulationDay,
      fertileStart: fertileWindowStart,
      fertileEnd: fertileWindowEnd,
      nextPeriod: new Date(lastPeriod.setDate(lastPeriod.getDate() + cycleData.cycleLength))
    };
  };

  const dates = calculateDates();
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Fertility Calendar</Text>
      </View>
      
      {Platform.OS === 'android' && (
        <TouchableOpacity
          style={styles.datePickerButton}
          onPress={showPicker}
        >
          <Text style={styles.datePickerButtonText}>
            Select Period Date
          </Text>
        </TouchableOpacity>
      )}

      <View style={[styles.datesContainer, Platform.OS === 'android' && styles.datesContainerAndroid]}>
        <DateItem
          label="Last Period Started"
          date={formatDate(cycleData.lastPeriodDate)}
          color="#FF69B4"
        />
        <DateItem
          label="Estimated Ovulation"
          date={formatDate(dates.ovulation)}
          color="#6200ee"
        />
        <DateItem
          label="Fertile Window"
          date={`${formatDate(dates.fertileStart)} - ${formatDate(dates.fertileEnd)}`}
          color="#E8F4FE"
        />
        <DateItem
          label="Next Period Expected"
          date={formatDate(dates.nextPeriod)}
          color="#FF69B4"
        />
      </View>

      {(showDatePicker || Platform.OS === 'ios') && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          style={Platform.OS === 'ios' ? styles.iosDatePicker : undefined}
        />
      )}
    </View>
  );
};

const DateItem = ({ label, date, color }) => (
  <View style={styles.dateItem}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <View style={styles.dateContent}>
      <Text style={styles.dateLabel}>{label}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  datePickerButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  datePickerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  datesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datesContainerAndroid: {
    marginTop: 8,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  dateContent: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  iosDatePicker: {
    width: '100%',
    backgroundColor: 'white',
  },
});

export default OvulationCalendar; 