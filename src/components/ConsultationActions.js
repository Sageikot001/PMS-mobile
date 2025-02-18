import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ConsultationActions = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.actionsContainer}>
      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('HealthcareProfessionals', { type: 'pharmacist' })}
      >
        <Text style={styles.actionIcon}>💊</Text>
        <Text style={styles.actionText}>Speak to a pharmacist</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('HealthcareProfessionals', { type: 'doctor' })}
      >
        <Text style={styles.actionIcon}>👨‍⚕️</Text>
        <Text style={styles.actionText}>Speak to a doctor</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton}
        onPress={() => navigation.navigate('OrderDrugs')}
      >
        <Text style={styles.actionIcon}>🏥</Text>
        <Text style={styles.actionText}>Order drugs</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionsContainer: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default ConsultationActions; 