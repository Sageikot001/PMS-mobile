import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Terms = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms and conditions</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last updated: March 15, 2024</Text>

          <View style={styles.termSection}>
            <Text style={styles.termTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.termText}>
              By accessing and using the Pharmarun application, you agree to be bound by these Terms and Conditions.
              If you do not agree to these terms, please do not use our services.
            </Text>
          </View>

          <View style={styles.termSection}>
            <Text style={styles.termTitle}>2. Use of Services</Text>
            <Text style={styles.termText}>
              Our services are available only to individuals who can form legally binding contracts under applicable law.
              The services must be used in accordance with all applicable laws and regulations.
            </Text>
          </View>

          <View style={styles.termSection}>
            <Text style={styles.termTitle}>3. Privacy Policy</Text>
            <Text style={styles.termText}>
              Your use of Pharmarun is also governed by our Privacy Policy. Please review our Privacy Policy to understand
              our practices regarding your personal information.
            </Text>
          </View>

          <View style={styles.termSection}>
            <Text style={styles.termTitle}>4. User Accounts</Text>
            <Text style={styles.termText}>
              You are responsible for maintaining the confidentiality of your account information and password.
              You agree to notify us immediately of any unauthorized use of your account.
            </Text>
          </View>

          <View style={styles.termSection}>
            <Text style={styles.termTitle}>5. Medical Information</Text>
            <Text style={styles.termText}>
              The medical information provided through our platform is for general informational purposes only and should
              not be considered as professional medical advice.
            </Text>
          </View>

          <TouchableOpacity style={styles.privacyButton}>
            <Text style={styles.privacyButtonText}>View Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  termSection: {
    marginBottom: 24,
  },
  termTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  termText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  privacyButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  privacyButtonText: {
    color: '#7E3AF2',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Terms; 