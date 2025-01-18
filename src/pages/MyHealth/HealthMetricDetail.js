import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const HealthMetricDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { metricId } = route.params;
  const [value, setValue] = useState('');

  const getMetricDetails = (id) => {
    const metrics = {
      weight: { 
        title: 'Weight', 
        unit: 'kg',
        didYouKnow: 'Maintaining a healthy weight is important for overall well-being as it reduces the risk of various chronic conditions such as heart disease, and diabetes.'
      },
      height: { 
        title: 'Height', 
        unit: 'cm',
        didYouKnow: 'Adult height is a result of both genetic and environmental factors. Proper nutrition during childhood and adolescence is crucial for reaching optimal height.'
      },
      bp: { 
        title: 'Blood Pressure', 
        unit: 'mmHg',
        didYouKnow: 'Regular blood pressure monitoring helps detect hypertension early. Normal blood pressure is typically around 120/80 mmHg.'
      },
      bodymass: {
        title: 'Body Mass',
        unit: 'kg/m²',
        didYouKnow: 'BMI is a useful screening tool for weight categories. A healthy BMI typically ranges from 18.5 to 24.9.'
      },
      bodyfat: {
        title: 'Body Fat',
        unit: '%',
        didYouKnow: 'Body fat percentage is a better indicator of fitness than weight alone. Healthy ranges vary by age and gender.'
      },
      bodywater: {
        title: 'Body Water',
        unit: '%',
        didYouKnow: 'Body water percentage is crucial for maintaining body temperature and removing waste. Adults should maintain about 50-65% body water.'
      },
      musclemass: {
        title: 'Muscle Mass',
        unit: 'kg',
        didYouKnow: 'Higher muscle mass increases your resting metabolic rate and helps maintain better mobility as you age.'
      },
      heartrate: {
        title: 'Heart Rate',
        unit: 'bpm',
        didYouKnow: 'A normal resting heart rate for adults ranges from 60-100 beats per minute. Athletes often have lower resting heart rates.'
      }
    };
    return metrics[id] || {
      title: 'Unknown Metric',
      unit: '',
      didYouKnow: 'Information not available for this metric.'
    };
  };

  const metric = getMetricDetails(metricId);
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handleSave = () => {
    // Save the value to your storage/backend
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{metric.title}</Text>
      
      <View style={styles.headerContainer}>
        <Text style={styles.valueDisplay}>{value || '0'}</Text>
        <Text style={styles.unit}>{metric.unit}</Text>
      </View>
      
      <Text style={styles.lastUpdated}>Last updated {currentDate}</Text>

      <View style={styles.didYouKnowCard}>
        <View style={styles.didYouKnowHeader}>
          <Text style={styles.didYouKnowIcon}>👋</Text>
          <Text style={styles.didYouKnowTitle}>Did you know?</Text>
        </View>
        <Text style={styles.didYouKnowText}>{metric.didYouKnow}</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Add New Entry</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder={`Enter ${metric.title.toLowerCase()}`}
          />
          <Text style={styles.inputUnit}>{metric.unit}</Text>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>History</Text>
        {/* Add your history items here */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  valueDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    marginRight: 8,
  },
  unit: {
    fontSize: 20,
    color: '#666',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  didYouKnowCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  didYouKnowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  didYouKnowIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  didYouKnowTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  didYouKnowText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 18,
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historySection: {
    marginBottom: 24,
  },
});

export default HealthMetricDetail; 