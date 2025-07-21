import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import HealthDataService from '../../../services/HealthDataService';

const DosageSchedule = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medication } = route.params;
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)); // 30 days from now
  const [pillsPerDosage, setPillsPerDosage] = useState(1);
  const [frequency, setFrequency] = useState(2); // times per day
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [dosageTimes, setDosageTimes] = useState([
    new Date(new Date().setHours(8, 0, 0, 0)), // 8:00 AM
    new Date(new Date().setHours(20, 0, 0, 0)), // 8:00 PM
  ]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const handlePillsChange = (increment) => {
    setPillsPerDosage(Math.max(1, pillsPerDosage + increment));
  };

  const handleFrequencyChange = (increment) => {
    const newFrequency = Math.max(1, Math.min(6, frequency + increment));
    setFrequency(newFrequency);
    
    // Adjust dosage times based on frequency
    const times = [];
    const hoursInterval = 24 / newFrequency;
    
    for (let i = 0; i < newFrequency; i++) {
      const hour = Math.floor(8 + (hoursInterval * i)) % 24; // Start at 8 AM
      times.push(new Date(new Date().setHours(hour, 0, 0, 0)));
    }
    
    setDosageTimes(times);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newTimes = [...dosageTimes];
      newTimes[selectedTimeIndex] = selectedTime;
      setDosageTimes(newTimes);
    }
  };

  const showTimePickerForIndex = (index) => {
    setSelectedTimeIndex(index);
    setShowTimePicker(true);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const saveMedication = async () => {
    try {
      setSaving(true);
      
      const medicationData = {
        name: medication.name,
        brand: medication.brand || '',
        dosage: `${pillsPerDosage} ${medication.dosageForm || 'tablet(s)'}`,
        frequency: frequency,
        dosageTimes: dosageTimes.map(time => time.toISOString()),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        instructions: `Take ${pillsPerDosage} ${medication.dosageForm || 'tablet(s)'} ${frequency} times daily`,
        prescribedBy: '', // Can be filled later
        purpose: medication.description || '',
        sideEffects: medication.sideEffects || '',
        reminderEnabled: reminderEnabled,
        
        // Additional medication details
        drugId: medication.id,
        strength: medication.strength || '',
        originalMedication: medication,
      };

      await HealthDataService.addMedication(medicationData);
      
      Alert.alert(
        'Success',
        `${medication.name} has been added to your medication schedule successfully!`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              navigation.navigate('AddMedication');
            }
          },
          {
            text: 'View Medications',
            onPress: () => {
              navigation.navigate('MedicationManagement');
            }
          },
          {
            text: 'Done',
            onPress: () => {
              navigation.navigate('MyHealth');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving medication:', error);
      Alert.alert('Error', 'Failed to save medication. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getDurationText = () => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getTotalPills = () => {
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return pillsPerDosage * frequency * diffDays;
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Dosage Schedule</Text>
      <Text style={styles.subtitle}>
        Set up dosage and schedule for {medication.name}
      </Text>

      {/* Medication Info */}
      <View style={styles.medicationCard}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        {medication.brand && (
          <Text style={styles.medicationBrand}>Brand: {medication.brand}</Text>
        )}
        <Text style={styles.medicationStrength}>{medication.strength}</Text>
        <Text style={styles.medicationForm}>{medication.dosageForm}</Text>
      </View>

      {/* Pills per dosage */}
      <View style={styles.settingSection}>
        <Text style={styles.settingTitle}>Pills per dosage</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => handlePillsChange(-1)}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{pillsPerDosage}</Text>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => handlePillsChange(1)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Frequency */}
      <View style={styles.settingSection}>
        <Text style={styles.settingTitle}>Times per day</Text>
        <View style={styles.counterContainer}>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => handleFrequencyChange(-1)}
          >
            <Text style={styles.counterButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterValue}>{frequency}</Text>
          <TouchableOpacity 
            style={styles.counterButton}
            onPress={() => handleFrequencyChange(1)}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dosage Times */}
      <View style={styles.settingSection}>
        <Text style={styles.settingTitle}>Dosage Times</Text>
        {dosageTimes.map((time, index) => (
          <TouchableOpacity
            key={index}
            style={styles.timeButton}
            onPress={() => showTimePickerForIndex(index)}
          >
            <Text style={styles.timeText}>
              Dose {index + 1}: {formatTime(time)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Start Date */}
      <View style={styles.settingSection}>
        <Text style={styles.settingTitle}>Start Date</Text>
        <Text style={styles.dateText}>{formatDate(startDate)}</Text>
      </View>

      {/* End Date */}
      <View style={styles.settingSection}>
        <Text style={styles.settingTitle}>End Date</Text>
        <Text style={styles.dateText}>{formatDate(endDate)}</Text>
        <Text style={styles.durationText}>Duration: {getDurationText()}</Text>
      </View>

      {/* Reminder */}
      <View style={styles.settingSection}>
        <View style={styles.reminderContainer}>
          <View>
            <Text style={styles.settingTitle}>Medication Reminders</Text>
            <Text style={styles.reminderSubtitle}>
              Get notified when it's time to take your medication
            </Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: '#e0e0e0', true: '#007bff' }}
            thumbColor={reminderEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <Text style={styles.summaryText}>
          Take {pillsPerDosage} {medication.dosageForm || 'tablet(s)'} {frequency} times daily
        </Text>
        <Text style={styles.summaryText}>
          Total pills needed: {getTotalPills()}
        </Text>
        <Text style={styles.summaryText}>
          Duration: {getDurationText()}
        </Text>
        {reminderEnabled && (
          <Text style={styles.summaryText}>
            ✅ Reminders enabled
          </Text>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={saveMedication}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Medication Schedule</Text>
        )}
      </TouchableOpacity>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={dosageTimes[selectedTimeIndex]}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  medicationCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  medicationName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicationBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicationStrength: {
    fontSize: 16,
    color: '#007bff',
    marginBottom: 4,
  },
  medicationForm: {
    fontSize: 14,
    color: '#666',
  },
  settingSection: {
    marginBottom: 24,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    backgroundColor: '#007bff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 30,
    color: '#333',
  },
  timeButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  reminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
  },
  summaryText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DosageSchedule; 