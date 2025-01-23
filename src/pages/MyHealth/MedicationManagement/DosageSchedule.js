import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

const DosageSchedule = () => {
  const navigation = useNavigation();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [pillsPerDosage, setPillsPerDosage] = useState(1);
  const [frequency, setFrequency] = useState(4);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [dosageTimes, setDosageTimes] = useState([]);

  const handlePillsChange = (increment) => {
    setPillsPerDosage(Math.max(1, pillsPerDosage + increment));
  };

  const handleFrequencyChange = (increment) => {
    setFrequency(Math.max(1, frequency + increment));
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Dosage Schedule</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How many pills per dosage</Text>
        <Text style={styles.sectionSubtitle}>
          How many tabs of this medication was prescribed per dosage
        </Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dosage frequency</Text>
        <Text style={styles.sectionSubtitle}>
          How many times in a day are you to use this medication
        </Text>
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

      <View style={styles.dateSection}>
        <Text style={styles.label}>Start on</Text>
        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateText}>
            {startDate.toLocaleDateString('en-GB', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            })}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateSection}>
        <Text style={styles.label}>Ends on</Text>
        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateText}>
            {endDate.toLocaleDateString('en-GB', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            })}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.reminderSection}>
        <View style={styles.reminderHeader}>
          <Text style={styles.reminderTitle}>Turn on reminder</Text>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ false: '#767577', true: '#6200ee' }}
          />
        </View>
        <Text style={styles.reminderSubtitle}>
          You will be reminder to use at dosage time
        </Text>
      </View>

      <TouchableOpacity style={styles.saveButton}>
        <Text style={styles.saveButtonText}>Save medication</Text>
      </TouchableOpacity>
    </View>
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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
  },
  counterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    color: '#6200ee',
  },
  counterValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
  },
  dateSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#6200ee',
  },
  reminderSection: {
    marginBottom: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reminderSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DosageSchedule; 