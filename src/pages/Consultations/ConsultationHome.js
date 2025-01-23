import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ConsultationActions from '../../components/ConsultationActions';

const ConsultationHome = () => {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Consultation</Text>
      </View>

      <Text style={styles.subtitle}>
        Connect with healthcare professionals for expert medical advice
      </Text>

      <ConsultationActions />

      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Why choose us?</Text>
        <View style={styles.features}>
          <View style={styles.featureCard}>
            <Ionicons name="shield-checkmark" size={24} color="#6200ee" />
            <Text style={styles.featureTitle}>Verified Professionals</Text>
            <Text style={styles.featureText}>All our healthcare providers are licensed and verified</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="time" size={24} color="#6200ee" />
            <Text style={styles.featureTitle}>Quick Response</Text>
            <Text style={styles.featureText}>Get medical advice within minutes</Text>
          </View>
          <View style={styles.featureCard}>
            <Ionicons name="lock-closed" size={24} color="#6200ee" />
            <Text style={styles.featureTitle}>Secure & Private</Text>
            <Text style={styles.featureText}>Your health information is protected</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    padding: 16,
    marginBottom: 16,
  },
  featuredSection: {
    padding: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  features: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default ConsultationHome; 