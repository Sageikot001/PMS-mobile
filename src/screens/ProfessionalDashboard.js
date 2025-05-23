import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getPatientAppointmentsByProfessionalId } from '../data/mockPatients';

const ProfessionalDashboard = ({ route }) => {
  const navigation = useNavigation();
  const { professional } = route.params;
  
  // Get today's appointments
  const today = new Date().toISOString().split('T')[0];
  const appointments = getPatientAppointmentsByProfessionalId(professional.id)
    .filter(apt => apt.date === today);

  const metrics = {
    appointmentsToday: appointments.length,
    pendingPrescriptions: professional.type === 'pharmacist' 
      ? professional.prescriptions.filter(rx => rx.status === 'pending').length
      : 0,
    activeConsultations: professional.type === 'doctor'
      ? appointments.filter(apt => apt.type === 'consultation').length
      : 0,
    earnings: professional.earnings,
  };

  const renderMetricCard = (title, value, subtitle) => (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      {subtitle && <Text style={styles.metricSubtitle}>{subtitle}</Text>}
    </View>
  );

  const renderQuickActions = () => {
    const actions = [
      {
        title: 'Appointments',
        icon: '📅',
        onPress: () => navigation.navigate('Appointments'),
      },
      {
        title: professional.type === 'doctor' ? 'Write Prescription' : 'View Prescriptions',
        icon: '💊',
        onPress: () => navigation.navigate('Prescriptions'),
      },
      {
        title: 'Patient Records',
        icon: '📋',
        onPress: () => navigation.navigate('PatientRecords'),
      },
      {
        title: 'Earnings',
        icon: '💰',
        onPress: () => navigation.navigate('Earnings'),
      },
    ];

    return (
      <View style={styles.quickActionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionButton}
            onPress={action.onPress}
          >
            <Text style={styles.quickActionIcon}>{action.icon}</Text>
            <Text style={styles.quickActionTitle}>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderUpcomingAppointments = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Appointments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Appointments')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      {appointments.length > 0 ? (
        appointments.map((appointment) => (
          <TouchableOpacity
            key={appointment.id}
            style={styles.appointmentCard}
            onPress={() => navigation.navigate('AppointmentDetails', { appointment })}
          >
            <View style={styles.appointmentTime}>
              <Text style={styles.appointmentTimeText}>{appointment.time}</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.patientName}>
                {appointment.patient.firstName} {appointment.patient.lastName}
              </Text>
              <Text style={styles.appointmentType}>{appointment.type}</Text>
            </View>
            <View style={styles.appointmentStatus}>
              <Text style={styles.statusText}>{appointment.status}</Text>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noAppointmentsText}>No appointments scheduled for today</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>
              Dr. {professional.firstName} {professional.lastName}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileButtonText}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsContainer}>
          {renderMetricCard(
            'Appointments Today',
            metrics.appointmentsToday,
            'scheduled'
          )}
          {professional.type === 'pharmacist' &&
            renderMetricCard(
              'Pending Prescriptions',
              metrics.pendingPrescriptions,
              'to process'
            )}
          {professional.type === 'doctor' &&
            renderMetricCard(
              'Active Consultations',
              metrics.activeConsultations,
              'in progress'
            )}
          {renderMetricCard(
            'Total Earnings',
            `₦${metrics.earnings.total.toLocaleString()}`,
            `₦${metrics.earnings.pending.toLocaleString()} pending`
          )}
        </View>

        {renderQuickActions()}
        {renderUpcomingAppointments()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 20,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    margin: 5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  metricTitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    margin: 5,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  quickActionTitle: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
  },
  section: {
    padding: 20,
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
  seeAllText: {
    color: '#4A90E2',
    fontSize: 14,
  },
  appointmentCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  appointmentTime: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 10,
    marginRight: 15,
  },
  appointmentTimeText: {
    color: '#fff',
    fontWeight: '600',
  },
  appointmentDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  appointmentType: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  appointmentStatus: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '600',
  },
  noAppointmentsText: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default ProfessionalDashboard; 