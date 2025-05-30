import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
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
      
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsContainer}
      >
        {healthMetrics.map((metric) => (
          <HealthCard
            key={metric.id}
            {...metric}
            onPress={() => handleMetricPress(metric.id)}
          />
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.managementCard}
        onPress={() => navigation.navigate('MedicationManagement')}
      >
        <Text style={styles.cardTitle}>Medication Management</Text>
        <Text style={styles.cardSubtitle}>
          Manage your medication schedule and never miss a dose with our reminders
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.managementCard}
        onPress={() => navigation.navigate('ConditionManagement')}
      >
        <Text style={styles.cardTitle}>Condition Management</Text>
        <Text style={styles.cardSubtitle}>
          Manage your health conditions with our condition management support
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.managementCard}
        onPress={() => navigation.navigate('WellnessCheck')}
      >
        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardTitle}>Wellness Calculator</Text>
            <Text style={styles.cardSubtitle}>
              Calculate your way to a healthier you
            </Text>
          </View>
          <View style={styles.iconContainer}>
            <Text style={styles.cardIcon}>📊</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.consultationCard}>
        <View style={styles.consultationContent}>
          <View style={styles.consultationTextContainer}>
            <Text style={styles.consultationTitle}>Book a Consultation</Text>
            <Text style={styles.consultationSubtitle}>
              Get connected to the right professional for your health
            </Text>
            <TouchableOpacity style={styles.scheduleButton}>
              <Text style={styles.scheduleButtonText}>Schedule now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.consultationImageContainer}>
            {/* <Image 
              source={ ('../../../assets/doctor-illustration.png')}
              style={styles.consultationImage}
              resizeMode="contain"
            /> */}
          </View>
        </View>
      </TouchableOpacity>
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
  metricsContainer: {
    paddingRight: 16,
    marginBottom: 20,
    gap: 12,
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
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  iconContainer: {
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 24,
  },
  consultationCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  consultationContent: {
    flexDirection: 'row',
    padding: 16,
  },
  consultationTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  consultationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  consultationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  scheduleButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  consultationImageContainer: {
    width: 100,
    justifyContent: 'center',
  },
  consultationImage: {
    width: '100%',
    height: 100,
  },
});

export default MyHealth; 