import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  ActivityIndicator,
  FlatList,
  RefreshControl
} from 'react-native';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import HealthDataService, { HEALTH_METRIC_TYPES } from '../../services/HealthDataService';

const HealthMetricDetail = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { metricId } = route.params;
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [currentMetricData, setCurrentMetricData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load metric data when component mounts or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMetricData();
    }, [metricId])
  );

  const loadMetricData = async () => {
    try {
      setLoading(true);
      const [metrics, metricHistory] = await Promise.all([
        HealthDataService.getHealthMetrics(),
        HealthDataService.getMetricHistory(metricId, 20),
      ]);
      
      const metricData = metrics[metricId];
      setCurrentMetricData(metricData);
      setHistory(metricHistory);
      
      // Clear input when loading fresh data
      setValue('');
      setNotes('');
    } catch (error) {
      console.error('Error loading metric data:', error);
      Alert.alert('Error', 'Failed to load metric data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMetricData();
    setRefreshing(false);
  };

  const getMetricDetails = (id) => {
    const metrics = {
      [HEALTH_METRIC_TYPES.WEIGHT]: { 
        title: 'Weight', 
        unit: 'kg',
        didYouKnow: 'Maintaining a healthy weight is important for overall well-being as it reduces the risk of various chronic conditions such as heart disease, and diabetes.',
        placeholder: 'Enter weight',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.HEIGHT]: { 
        title: 'Height', 
        unit: 'cm',
        didYouKnow: 'Adult height is a result of both genetic and environmental factors. Proper nutrition during childhood and adolescence is crucial for reaching optimal height.',
        placeholder: 'Enter height',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.BLOOD_PRESSURE]: { 
        title: 'Blood Pressure', 
        unit: 'mmHg',
        didYouKnow: 'Regular blood pressure monitoring helps detect hypertension early. Normal blood pressure is typically around 120/80 mmHg.',
        placeholder: 'e.g., 120/80',
        inputType: 'default',
      },
      [HEALTH_METRIC_TYPES.BMI]: {
        title: 'Body Mass Index',
        unit: 'kg/m²',
        didYouKnow: 'BMI is a useful screening tool for weight categories. A healthy BMI typically ranges from 18.5 to 24.9. BMI is usually calculated automatically from your height and weight.',
        placeholder: 'Enter BMI',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.BODY_FAT]: {
        title: 'Body Fat',
        unit: '%',
        didYouKnow: 'Body fat percentage is a better indicator of fitness than weight alone. Healthy ranges vary by age and gender.',
        placeholder: 'Enter body fat %',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.BODY_WATER]: {
        title: 'Body Water',
        unit: '%',
        didYouKnow: 'Body water percentage is crucial for maintaining body temperature and removing waste. Adults should maintain about 50-65% body water.',
        placeholder: 'Enter body water %',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.MUSCLE_MASS]: {
        title: 'Muscle Mass',
        unit: 'kg',
        didYouKnow: 'Muscle mass affects your metabolism and overall strength. Regular exercise helps maintain and build muscle mass.',
        placeholder: 'Enter muscle mass',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.HEART_RATE]: {
        title: 'Heart Rate',
        unit: 'bpm',
        didYouKnow: 'Resting heart rate is a good indicator of cardiovascular fitness. A normal resting heart rate ranges from 60-100 bpm.',
        placeholder: 'Enter heart rate',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.TEMPERATURE]: {
        title: 'Body Temperature',
        unit: '°C',
        didYouKnow: 'Normal body temperature is around 37°C (98.6°F). Temperature can vary throughout the day and with activity.',
        placeholder: 'Enter temperature',
        inputType: 'numeric',
      },
      [HEALTH_METRIC_TYPES.BLOOD_SUGAR]: {
        title: 'Blood Sugar',
        unit: 'mg/dL',
        didYouKnow: 'Normal fasting blood sugar levels are between 70-100 mg/dL. Regular monitoring is important for diabetes management.',
        placeholder: 'Enter blood sugar',
        inputType: 'numeric',
      },
    };
    
    return metrics[id] || { title: 'Unknown Metric', unit: '', didYouKnow: '', placeholder: 'Enter value', inputType: 'numeric' };
  };

  const handleSave = async () => {
    if (!value.trim()) {
      Alert.alert('Error', 'Please enter a value');
      return;
    }

    try {
      setSaving(true);
      const metric = getMetricDetails(metricId);
      
      const metricData = {
        value: value.trim(),
        unit: metric.unit,
        notes: notes.trim(),
        date: new Date().toISOString(),
        source: 'manual',
      };

      await HealthDataService.addHealthMetric(metricId, metricData);
      
      Alert.alert(
        'Success', 
        `${metric.title} saved successfully!`,
        [
          {
            text: 'Add Another',
            onPress: () => {
              setValue('');
              setNotes('');
              loadMetricData();
            }
          },
          {
            text: 'Done',
            onPress: () => {
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error saving metric:', error);
      Alert.alert('Error', 'Failed to save metric. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderHistoryItem = ({ item }) => {
    const metric = getMetricDetails(metricId);
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyValue}>
            {item.value} {metric.unit}
          </Text>
          <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
        </View>
        {item.notes && (
          <Text style={styles.historyNotes}>{item.notes}</Text>
        )}
        <Text style={styles.historySource}>
          Source: {item.source === 'manual' ? 'Manual Entry' : item.source}
        </Text>
      </View>
    );
  };

  const metric = getMetricDetails(metricId);
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading {metric.title}...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{metric.title}</Text>
      
      <View style={styles.headerContainer}>
        <Text style={styles.valueDisplay}>
          {currentMetricData?.current?.value || '0'}
        </Text>
        <Text style={styles.unit}>{metric.unit}</Text>
      </View>
      
      <Text style={styles.lastUpdated}>
        Last updated: {currentMetricData?.lastUpdated ? 
          formatDate(currentMetricData.lastUpdated) : 
          'Never'
        }
      </Text>

      {currentMetricData?.current?.category && (
        <View style={styles.categoryContainer}>
          <Text style={styles.categoryLabel}>Category:</Text>
          <Text style={[
            styles.categoryText,
            { color: currentMetricData.current.category === 'Normal weight' ? '#4caf50' : '#ff9800' }
          ]}>
            {currentMetricData.current.category}
          </Text>
        </View>
      )}

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
            keyboardType={metric.inputType}
            placeholder={metric.placeholder}
            placeholderTextColor="#999"
          />
          <Text style={styles.inputUnit}>{metric.unit}</Text>
        </View>

        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes (optional)"
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Entry</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>
          History ({history.length} {history.length === 1 ? 'entry' : 'entries'})
        </Text>
        {history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={styles.historyList}
          />
        ) : (
          <View style={styles.noHistoryContainer}>
            <Text style={styles.noHistoryText}>No entries yet</Text>
            <Text style={styles.noHistorySubtext}>Add your first {metric.title.toLowerCase()} measurement above</Text>
          </View>
        )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
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
    color: '#333',
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
    color: '#007bff',
  },
  unit: {
    fontSize: 20,
    color: '#666',
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
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
    color: '#333',
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
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#333',
  },
  inputUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#6200ee',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historySection: {
    marginBottom: 24,
  },
  historyList: {
    maxHeight: 400,
  },
  historyItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  historyNotes: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  historySource: {
    fontSize: 12,
    color: '#999',
  },
  noHistoryContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  noHistoryText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  noHistorySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default HealthMetricDetail; 