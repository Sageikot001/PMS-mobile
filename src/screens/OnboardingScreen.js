import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState(null);

  const userTypes = [
    {
      id: 'patient',
      title: 'Patient/Client',
      description: 'Access healthcare services and manage your health records',
      icon: '👤',
    },
    {
      id: 'professional',
      title: 'Healthcare Professional',
      description: 'Doctor, Pharmacist, or other healthcare provider',
      icon: '👨‍⚕️',
    },
    {
      id: 'institution',
      title: 'Healthcare Institution',
      description: 'Hospital, Clinic, or Pharmacy',
      icon: '🏥',
    },
  ];

  const handleUserTypeSelection = (type) => {
    setSelectedType(type);
    switch (type) {
      case 'patient':
        navigation.navigate('Login'); // Navigate to authentication
        break;
      case 'professional':
        navigation.navigate('ProfessionalOnboarding');
        break;
      case 'institution':
        navigation.navigate('InstitutionOnboarding');
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to CarePoint</Text>
          <Text style={styles.subtitle}>
            Please select your account type to get started
          </Text>
        </View>

        <View style={styles.optionsContainer}>
          {userTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.optionCard,
                selectedType === type.id && styles.selectedCard,
              ]}
              onPress={() => handleUserTypeSelection(type.id)}
            >
              <Text style={styles.optionIcon}>{type.icon}</Text>
              <Text style={styles.optionTitle}>{type.title}</Text>
              <Text style={styles.optionDescription}>{type.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedCard: {
    borderColor: '#4A90E2',
    backgroundColor: '#EBF5FF',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});

export default OnboardingScreen; 