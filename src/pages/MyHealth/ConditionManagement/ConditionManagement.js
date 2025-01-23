import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ConditionManagement = () => {
  const navigation = useNavigation();

  const handleAddCondition = () => {
    navigation.navigate('AddCondition');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Condition management</Text>

      <View style={styles.emptyStateContainer}>
        {/* <Image 
          source={require('../../../../assets/condition-illustration.png')}
          style={styles.conditionIcon}
          resizeMode="contain"
        /> */}
        <Text style={styles.heading}>Manage your condition</Text>
        <Text style={styles.subtitle}>
          You're currently not managing any condition. Click{'\n'}
          'Manage condition' to get started
        </Text>
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddCondition}
        >
          <Text style={styles.addButtonText}>+ Manage condition</Text>
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
  conditionIcon: {
    width: 240,
    height: 240,
    marginBottom: 32,
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

export default ConditionManagement; 