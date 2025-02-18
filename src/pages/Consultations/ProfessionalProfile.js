import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfessionalProfile = ({ route, navigation }) => {
  const { provider } = route.params;
  const [showBooking, setShowBooking] = useState(false);

  const renderSpecializations = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Specializations</Text>
      <View style={styles.specializationsList}>
        {provider.specializations.map((spec, index) => (
          <View key={index} style={styles.specializationChip}>
            <Text style={styles.specializationText}>{spec}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderEducation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      {provider.education.map((edu, index) => (
        <View key={index} style={styles.educationItem}>
          <Text style={styles.institutionText}>{edu.institution}</Text>
          <Text style={styles.degreeText}>{edu.degree}</Text>
          <Text style={styles.yearText}>{edu.year}</Text>
        </View>
      ))}
    </View>
  );

  const renderCurrentPractice = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Current Practice</Text>
      {provider.currentInstitution ? (
        <View style={styles.practiceItem}>
          <Ionicons name="business-outline" size={20} color="#666" />
          <View style={styles.practiceDetails}>
            <Text style={styles.institutionText}>{provider.currentInstitution}</Text>
            {provider.institutionAddress && (
              <Text style={styles.addressText}>{provider.institutionAddress}</Text>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.practiceItem}>
          <Ionicons name="business-outline" size={20} color="#666" />
          <Text style={styles.noInstitutionText}>Independent Practice</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.imagePlaceholder}>
            <Ionicons 
              name={provider.type === 'pharmacist' ? 'medical' : 'medical-outline'} 
              size={40} 
              color="#7E3AF2"
            />
          </View>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.specialty}>{provider.specialty}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Ionicons name="star" size={16} color="#FFB800" />
              <Text style={styles.statText}>{provider.rating}</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>{provider.experience} years</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people-outline" size={16} color="#666" />
              <Text style={styles.statText}>{provider.consultations}+ consults</Text>
            </View>
          </View>

          <View style={styles.consultationFee}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.feeText}>₦{provider.hourlyRate}/hour</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{provider.about}</Text>
        </View>

        {renderCurrentPractice()}
        {renderSpecializations()}
        {renderEducation()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('BookAppointment', { provider })}
        >
          <Text style={styles.bookButtonText}>Book Consultation</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    paddingTop: 48,
  },
  backButton: {
    padding: 8,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 16,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  specialty: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  specializationsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specializationChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  specializationText: {
    color: '#666',
    fontSize: 14,
  },
  educationItem: {
    marginBottom: 16,
  },
  institutionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  degreeText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  yearText: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  bookButton: {
    backgroundColor: '#7E3AF2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  consultationFee: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
    gap: 4,
  },
  feeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  practiceDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  noInstitutionText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default ProfessionalProfile; 