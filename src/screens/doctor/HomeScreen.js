import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For avatar placeholder
import { useRoute, useNavigation } from '@react-navigation/native';

// Mock data for appointments - replace with actual data fetching later
const mockTodaysAppointments = [
  {
    id: 'apt1',
    time: '9:00 AM',
    patientName: 'Sarah Walker',
    type: 'Video Call',
  },
  {
    id: 'apt2',
    time: '10:00 AM',
    patientName: 'John Casey',
    type: 'Phone Call',
  },
  {
    id: 'apt3',
    time: '11:30 AM',
    patientName: 'Morgan Grimes',
    type: 'In-Person',
  },
];

// Mock data for recent patients - replace later
const mockRecentPatients = [
  { id: 'rp1', name: 'Chuck Bartowski' },
  { id: 'rp2', name: 'Ellie Woodcomb' },
  { id: 'rp3', name: 'Devon Woodcomb' },
  { id: 'rp4', name: 'General Beckman' },
];

const DoctorHomeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  // const { professional } = route.params; // Assuming professional data is passed via route

  // Fallback to a default professional object if not passed or for testing
  const professional = route.params?.professional || {
    firstName: 'John',
    lastName: 'Smith',
    // Add other necessary professional fields if needed for the UI
  };

  const renderAppointmentCard = ({ item }) => (
    <View style={styles.appointmentCard}>
      <Text style={styles.appointmentTime}>{item.time}</Text>
      <View style={styles.appointmentDetails}>
        <Text style={styles.appointmentPatientName}>{item.patientName}</Text>
        <Text style={styles.appointmentType}>{item.type}</Text>
      </View>
      <View style={styles.appointmentActions}>
        <TouchableOpacity style={styles.actionButtonSmall} onPress={() => alert('Start Phone Call')}>
          <Ionicons name="call-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSmall} onPress={() => alert('Start Video Call')}>
          <Ionicons name="videocam-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRecentPatientCard = ({ item }) => (
    <TouchableOpacity style={styles.recentPatientCard} onPress={() => alert(`View patient ${item.name}`)}>
      <View style={styles.recentPatientAvatarPlaceholder} />
      <Text style={styles.recentPatientName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle-outline" size={50} color="#7F8C8D" />
          </View>
          <Text style={styles.doctorName}>
            Dr. {professional.firstName} {professional.lastName}
          </Text>
        </View>

        {/* Today's Appointments */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Today's Appointments</Text>
          {mockTodaysAppointments.length > 0 ? (
            mockTodaysAppointments.map((item) => (
              <View key={item.id}>{renderAppointmentCard({ item })}</View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No appointments for today.</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => alert('Write Rx')}>
            <Ionicons name="pencil-outline" size={24} color="#4A90E2" />
            <Text style={styles.quickActionButtonText}>Write Rx</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => alert('Start Call')}>
            <Ionicons name="play-circle-outline" size={24} color="#4A90E2" />
            <Text style={styles.quickActionButtonText}>Start Call</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Patients */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recent Patients</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentPatientsScroll}>
            {mockRecentPatients.map((patient) => (
              <View key={patient.id}>{renderRecentPatientCard({item: patient})}</View>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  // Section
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#7F8C8D',
    marginTop: 10,
    fontStyle: 'italic',
  },
  // Appointment Card
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    width: 70, // Fixed width for time alignment
  },
  appointmentDetails: {
    flex: 1,
    marginLeft: 10,
  },
  appointmentPatientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  appointmentType: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
  },
  appointmentActions: {
    flexDirection: 'row',
  },
  actionButtonSmall: {
    padding: 8,
    marginLeft: 8,
    // backgroundColor: '#EBF5FF',
    // borderRadius: 20,
  },
  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    marginTop: 10,
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#EBF5FF',
    flex: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  quickActionButtonText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Recent Patients
  recentPatientsScroll: {
    paddingBottom: 10, // For shadow visibility
  },
  recentPatientCard: {
    width: 100,
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recentPatientAvatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E9ECEF',
    marginBottom: 8,
  },
  recentPatientName: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
  },
});

export default DoctorHomeScreen; 