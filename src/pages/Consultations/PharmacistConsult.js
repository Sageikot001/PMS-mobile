import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PharmacistConsult = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Speak to a Pharmacist</Text>
      <Text style={styles.subtitle}>
        Get professional advice from licensed pharmacists
      </Text>

      <View style={styles.consultationTypes}>
        <TouchableOpacity style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Quick Chat</Text>
            <Text style={styles.price}>Free</Text>
          </View>
          <Text style={styles.optionDescription}>
            Brief consultation about medications and general health queries
          </Text>
          <Text style={styles.duration}>Average wait: 5 mins</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionTitle}>Detailed Consultation</Text>
            <Text style={styles.price}>₦2,000</Text>
          </View>
          <Text style={styles.optionDescription}>
            In-depth medication review and health advice
          </Text>
          <Text style={styles.duration}>30 mins session</Text>
        </TouchableOpacity>
      </View>
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
    padding: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  consultationTypes: {
    gap: 16,
  },
  optionCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 16,
    color: '#6200ee',
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  duration: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PharmacistConsult; 