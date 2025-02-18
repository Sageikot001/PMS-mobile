import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ConsultationActions from '../../components/ConsultationActions';
import { providers } from '../../data/providers';
import HealthcareProviderCard from '../../components/cards/HealthcareProviderCard';

const ConsultationHome = ({ navigation }) => {
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  const WelcomeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showWelcomeModal}
      onRequestClose={() => setShowWelcomeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Why choose us?</Text>
          <View style={styles.features}>
            <View style={styles.featureCard}>
              <Ionicons name="shield-checkmark" size={24} color="#6200ee" />
              <Text style={styles.featureTitle}>Verified Professionals</Text>
              <Text style={styles.featureText}>
                All our healthcare providers are licensed and verified
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="time" size={24} color="#6200ee" />
              <Text style={styles.featureTitle}>Quick Response</Text>
              <Text style={styles.featureText}>
                Get medical advice within minutes
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Ionicons name="lock-closed" size={24} color="#6200ee" />
              <Text style={styles.featureTitle}>Secure & Private</Text>
              <Text style={styles.featureText}>
                Your health information is protected
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowWelcomeModal(false)}
          >
            <Text style={styles.closeButtonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      <WelcomeModal />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Book a Consultation</Text>
          <Text style={styles.subtitle}>
            Get connected to the right professional for your health
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Consultation Type</Text>
          <ConsultationActions />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Pharmacists</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.providersScroll}
          >
            {providers.pharmacists.slice(0, 3).map((pharmacist) => (
              <HealthcareProviderCard
                key={pharmacist.id}
                provider={{ ...pharmacist, type: 'pharmacist' }}
                onPress={() => navigation.navigate('ProfessionalProfile', {
                  provider: { ...pharmacist, type: 'pharmacist' }
                })}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Doctors</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.providersScroll}
          >
            {providers.doctors.slice(0, 3).map((doctor) => (
              <HealthcareProviderCard
                key={doctor.id}
                provider={{ ...doctor, type: 'doctor' }}
                onPress={() => navigation.navigate('ProfessionalProfile', {
                  provider: { ...doctor, type: 'doctor' }
                })}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  providersScroll: {
    paddingBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: Dimensions.get('window').width * 0.9,
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  features: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConsultationHome; 