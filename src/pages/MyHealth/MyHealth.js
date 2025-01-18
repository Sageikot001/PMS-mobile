import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HealthCard from './components/HealthCard';

const MyHealth = () => {
  const navigation = useNavigation();

  const healthMetrics = [
    { id: 'weight', title: 'Weight', value: '0', unit: 'kg', icon: '⚖️' },
    { id: 'height', title: 'Height', value: '0', unit: 'cm', icon: '📏' },
    { id: 'bp', title: 'Blood Pressure', value: '0', unit: 'mmHg', icon: '❤️' },
    { id: 'bodymass', title: 'Body Mass', value: '0', unit: 'kg/m²', icon: '🏋️' },
    { id: 'bodyfat', title: 'Body Fat', value: '0', unit: '%', icon: '📊' },
    { id: 'bodywater', title: 'Body Water', value: '0', unit: '%', icon: '💧' },
    { id: 'musclemass', title: 'Muscle Mass', value: '0', unit: 'kg', icon: '💪' },
    { id: 'heartrate', title: 'Heart Rate', value: '0', unit: 'bpm', icon: '💓' },
  ];

  const handleMetricPress = (metricId) => {
    navigation.navigate('HealthMetricDetail', { metricId });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Health</Text>
      
      <View style={styles.metricsGrid}>
        {healthMetrics.map((metric) => (
          <HealthCard
            key={metric.id}
            {...metric}
            onPress={() => handleMetricPress(metric.id)}
          />
        ))}
      </View>

      {/* Additional sections from your design */}
      <TouchableOpacity style={styles.managementCard}>
        <Text style={styles.cardTitle}>Medication Management</Text>
        <Text style={styles.cardSubtitle}>
          Manage your medication schedule and never miss a dose with our reminders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.managementCard}>
        <Text style={styles.cardTitle}>Condition Management</Text>
        <Text style={styles.cardSubtitle}>
          Manage your health conditions with our condition management support
        </Text>
      </TouchableOpacity>

      {/* Add other sections as needed */}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  managementCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default MyHealth; 