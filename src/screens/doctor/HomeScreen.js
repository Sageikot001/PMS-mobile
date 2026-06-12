import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { appointmentsAPI, notificationsAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// Mock data for recent patients - patients who recently had appointments
const mockRecentPatients = [
  { id: 'p1', name: 'Judith Scoft', lastAppointment: '2024-01-10', condition: 'Hypertension' },
  { id: 'p2', name: 'Samuel Cole', lastAppointment: '2024-01-08', condition: 'Back pain' },
  { id: 'p3', name: 'Rose Nguyen', lastAppointment: '2024-01-05', condition: 'Diabetes follow-up' },
  { id: 'p4', name: 'Eugene Porter', lastAppointment: '2024-01-03', condition: 'Anxiety management' },
];

const DoctorHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Derive display name from auth user; doctor profile object may be nested
  const doctorProfile = {
    firstName: user?.name?.split(' ')[0] ?? user?.firstName ?? 'Doctor',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? user?.lastName ?? '',
    specialization: user?.doctor?.specialization ?? user?.specialization ?? '',
    avatar: user?.profilePicture ?? user?.avatar ?? null,
  };

  // Load today's appointments from the API
  const loadTodaysAppointments = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];
      const res = await appointmentsAPI.list({
        date: today,
        role: 'doctor',
        limit: 50,
      });

      const allAppointments = res?.data?.data?.appointments ?? res?.data?.data ?? [];
      const todaysAppts = allAppointments.filter((apt) => {
        if (!apt.appointmentDate) return false;
        return new Date(apt.appointmentDate).toISOString().split('T')[0] === today;
      });

      setTodaysAppointments(todaysAppts);
    } catch (error) {
      console.error('Error loading today\'s appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create in-app notifications for today's upcoming appointments
  const scheduleAppointmentNotifications = async (appointments) => {
    try {
      for (const apt of appointments) {
        if (apt.status === 'scheduled' || apt.status === 'confirmed') {
          await notificationsAPI.create({
            title: 'Upcoming Appointment',
            message: `You have an appointment${apt.reason ? ` for ${apt.reason}` : ''} today.`,
            type: 'appointment_reminder',
            referenceId: apt._id ?? apt.id,
          }).catch(() => {}); // non-critical — ignore individual failures
        }
      }
    } catch (error) {
      console.error('Error creating appointment notifications:', error);
    }
  };

  // Load appointments on mount
  useEffect(() => {
    loadTodaysAppointments();
  }, []);

  // Re-load appointments when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTodaysAppointments();
    }, [])
  );

  // Handle profile navigation
  const handleProfilePress = () => {
    navigation.navigate('Profile', { doctorProfile });
  };

  const renderAppointmentCard = ({ item }) => {
    // Backend stores appointmentDate as ISO string; extract HH:MM for display
    const timeLabel = item.appointmentDate
      ? new Date(item.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '--:--';
    // Patient name may be populated as an object or a plain string
    const patientName =
      item.patient?.name ?? item.patient?.user?.name ?? item.patientName ?? 'Patient';
    const reasonLabel = item.reason ?? item.type ?? 'Consultation';

    return (
      <TouchableOpacity
        style={styles.appointmentCard}
        onPress={() => navigation.navigate('AppointmentDetails', {
          appointmentId: item._id ?? item.id,
          appointment: item,
        })}
      >
        <Text style={styles.appointmentTime}>{timeLabel}</Text>
        <View style={styles.appointmentDetails}>
          <Text style={styles.appointmentPatientName}>{patientName}</Text>
          <Text style={styles.appointmentType}>{reasonLabel}</Text>
        </View>
        <View style={styles.appointmentActions}>
          <View style={[
            styles.statusIndicator,
            item.status === 'scheduled' || item.status === 'confirmed' ? styles.acceptedStatus :
            item.status === 'cancelled' ? styles.rejectedStatus : styles.pendingStatus,
          ]}>
            <Text style={styles.statusText}>{item.status || 'Pending'}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentPatientCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.recentPatientCard} 
      onPress={() => navigation.navigate('PatientDetails', { 
        patientId: item.id, 
        patientName: item.name 
      })}
    >
      <View style={styles.recentPatientAvatarPlaceholder}>
        <Ionicons name="person" size={30} color="#7F8C8D" />
      </View>
      <Text style={styles.recentPatientName} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.recentPatientCondition} numberOfLines={1}>{item.condition}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.headerLeft}
            onPress={handleProfilePress}
          >
            <View style={styles.avatarPlaceholder}>
              {doctorProfile.avatar ? (
                <Image 
                  source={{ uri: doctorProfile.avatar }} 
                  style={styles.avatarImage}
                />
              ) : (
                <Ionicons name="person-circle-outline" size={50} color="#4A90E2" />
              )}
            </View>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                Dr. {doctorProfile.firstName} {doctorProfile.lastName}
              </Text>
              <Text style={styles.doctorSpecialization}>
                {doctorProfile.specialization}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => navigation.navigate('NotificationsScreen')}
            >
              <View style={styles.notificationIconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#4A90E2" />
                {/* You can add a badge here for unread notifications */}
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Appointments */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Appointments</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <Text style={styles.emptyStateText}>Loading appointments...</Text>
          ) : todaysAppointments.length > 0 ? (
            todaysAppointments.map((item) => (
              <View key={item.id}>{renderAppointmentCard({ item })}</View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No appointments for today.</Text>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('PrescriptionQueue')}>
            <MaterialCommunityIcons name="prescription" size={24} color="#4A90E2" />
            <Text style={styles.quickActionButtonText}>Write Rx</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Appointments')}>
            <Ionicons name="calendar-outline" size={24} color="#4A90E2" />
            <Text style={styles.quickActionButtonText}>Appointments</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Patients */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Patients</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Patients')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  doctorInfo: {
    flexDirection: 'column',
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  doctorSpecialization: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationButton: {
    padding: 5,
  },
  notificationIconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 2,
    paddingVertical: 1,
    position: 'absolute',
    top: -5,
    right: -5,
  },
  notificationBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Section
  sectionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
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
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  pendingStatus: {
    backgroundColor: '#FFF3CD',
  },
  acceptedStatus: {
    backgroundColor: '#D4EDDA',
  },
  rejectedStatus: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentPatientName: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '600',
  },
  recentPatientCondition: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default DoctorHomeScreen; 