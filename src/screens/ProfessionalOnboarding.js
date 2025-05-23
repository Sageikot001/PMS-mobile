import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfessionalOnboarding = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [professionalType, setProfessionalType] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    certifications: [],
  });

  const professionalTypes = [
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'Medical Doctor, Specialist, or Consultant',
      icon: '👨‍⚕️',
    },
    {
      id: 'pharmacist',
      title: 'Pharmacist',
      description: 'Licensed Pharmacist or Pharmacy Manager',
      icon: '💊',
    },
  ];

  const handleProfessionalTypeSelection = (type) => {
    setProfessionalType(type);
    setStep(2);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Temporary mock professional data for testing
      const mockProfessional = {
        id: '1',
        type: 'doctor',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@carepoint.com',
        phone: '+2348012345678',
        licenseNumber: 'MD123456',
        specialization: 'Cardiology',
        yearsOfExperience: '15',
        certifications: [
          {
            id: 'cert1',
            name: 'Board Certification in Cardiology',
            issueDate: '2015-06-15',
            expiryDate: '2025-06-15',
          },
        ],
        workingHours: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
        },
        appointments: [
          {
            id: 'apt1',
            patientId: 'p1',
            date: '2024-03-20',
            time: '10:00',
            status: 'scheduled',
            type: 'consultation',
          },
        ],
        earnings: {
          total: 250000,
          pending: 15000,
          lastPayout: '2024-02-28',
        },
      };

      // Navigate to ProfessionalHome with mock data
      navigation.navigate('ProfessionalHome', { professional: mockProfessional });
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Professional Type</Text>
      <View style={styles.optionsContainer}>
        {professionalTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionCard,
              professionalType === type.id && styles.selectedCard,
            ]}
            onPress={() => handleProfessionalTypeSelection(type.id)}
          >
            <Text style={styles.optionIcon}>{type.icon}</Text>
            <Text style={styles.optionTitle}>{type.title}</Text>
            <Text style={styles.optionDescription}>{type.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="First Name"
          value={formData.firstName}
          onChangeText={(value) => handleInputChange('firstName', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          value={formData.lastName}
          onChangeText={(value) => handleInputChange('lastName', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(value) => handleInputChange('email', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          keyboardType="phone-pad"
          value={formData.phone}
          onChangeText={(value) => handleInputChange('phone', value)}
        />
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Professional Details</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="License Number"
          value={formData.licenseNumber}
          onChangeText={(value) => handleInputChange('licenseNumber', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Specialization"
          value={formData.specialization}
          onChangeText={(value) => handleInputChange('specialization', value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Years of Experience"
          keyboardType="numeric"
          value={formData.yearsOfExperience}
          onChangeText={(value) => handleInputChange('yearsOfExperience', value)}
        />
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Certifications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Complete Registration</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Professional Registration</Text>
          <Text style={styles.subtitle}>Step {step} of 3</Text>
        </View>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
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
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
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
  formContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  nextButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfessionalOnboarding; 