import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';

const DoctorProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorId, doctorName } = route.params;

  // Mock doctor data (in a real app, this would come from API)
  const doctorData = {
    id: doctorId,
    name: doctorName || 'Dr. John Smith',
    specialty: 'Cardiology',
    email: 'ikotnsikak@gmail.com',
    phone: '+234 803 123 4567',
    licenseNumber: 'MD123456',
    experience: '15 years',
    hospital: 'City General Hospital',
    department: 'Cardiology',
    rating: 4.8,
    totalPatients: 1250,
    completedAppointments: 3420,
    education: [
      'MBBS - University of Lagos',
      'MD Cardiology - Harvard Medical School',
      'Fellowship in Interventional Cardiology'
    ],
    certifications: [
      'Board Certified in Cardiology',
      'Advanced Cardiac Life Support (ACLS)',
      'Basic Life Support (BLS)'
    ],
    languages: ['English', 'French', 'Spanish'],
    availability: {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 1:00 PM',
      sunday: 'Closed'
    }
  };

  const renderInfoRow = (icon, label, value) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color="#4A90E2" />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Doctor Avatar and Basic Info */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {doctorData.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>
          
          <Text style={styles.doctorName}>{doctorData.name}</Text>
          <Text style={styles.specialty}>{doctorData.specialty}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.rating}>{doctorData.rating}</Text>
            <Text style={styles.ratingText}>({doctorData.totalPatients} patients)</Text>
          </View>
        </View>

        {/* Contact Information */}
        {renderSection('Contact Information', (
          <View style={styles.card}>
            {renderInfoRow('mail', 'Email', doctorData.email)}
            {renderInfoRow('call', 'Phone', doctorData.phone)}
            {renderInfoRow('business', 'Hospital', doctorData.hospital)}
            {renderInfoRow('medical', 'Department', doctorData.department)}
          </View>
        ))}

        {/* Professional Information */}
        {renderSection('Professional Information', (
          <View style={styles.card}>
            {renderInfoRow('card', 'License Number', doctorData.licenseNumber)}
            {renderInfoRow('time', 'Experience', doctorData.experience)}
            {renderInfoRow('people', 'Total Patients', doctorData.totalPatients.toLocaleString())}
            {renderInfoRow('checkmark-circle', 'Completed Appointments', doctorData.completedAppointments.toLocaleString())}
          </View>
        ))}

        {/* Education */}
        {renderSection('Education', (
          <View style={styles.card}>
            {doctorData.education.map((degree, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="school" size={16} color="#4A90E2" />
                <Text style={styles.listText}>{degree}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Certifications */}
        {renderSection('Certifications', (
          <View style={styles.card}>
            {doctorData.certifications.map((cert, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="ribbon" size={16} color="#4A90E2" />
                <Text style={styles.listText}>{cert}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Languages */}
        {renderSection('Languages', (
          <View style={styles.card}>
            <View style={styles.languagesContainer}>
              {doctorData.languages.map((language, index) => (
                <View key={index} style={styles.languageTag}>
                  <Text style={styles.languageText}>{language}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Availability */}
        {renderSection('Availability', (
          <View style={styles.card}>
            {Object.entries(doctorData.availability).map(([day, hours]) => (
              <View key={day} style={styles.availabilityRow}>
                <Text style={styles.dayText}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>
                <Text style={styles.hoursText}>{hours}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  doctorName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  listText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  languageTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  availabilityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dayText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default DoctorProfile; 