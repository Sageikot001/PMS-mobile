import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const MedicationManagement = () => {
  const navigation = useNavigation();

  const handleAddMedication = () => {
    navigation.navigate('AddMedication');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Medication management</Text>

      <View style={styles.emptyStateContainer}>
        {/* <Image 
          source={ ('../../../../assets/medication-icon.png')}
          style={styles.medicationIcon}
          resizeMode="contain"
        /> */}
        <Text style={styles.heading}>Manage your medication</Text>
        <Text style={styles.subtitle}>
          You are not managing any medications right now.{'\n'}
          To begin managing your medications, click the "Add medication" button below.
        </Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddMedication}
        >
          <Text style={styles.addButtonText}>+ Add medication</Text>
        </TouchableOpacity>
      </View>
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  medicationIcon: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MedicationManagement; 