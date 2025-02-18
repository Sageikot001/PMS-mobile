import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppointmentConfirmation = ({ route, navigation }) => {
  const { provider, appointmentDate, appointmentTime, reason, additionalInfo } = route.params;

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => navigation.navigate('MainLayout')}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#34C759" />
          </View>
          
          <Text style={styles.title}>Appointment Confirmed!</Text>
          <Text style={styles.subtitle}>
            Your consultation has been successfully scheduled
          </Text>

          <View style={styles.appointmentCard}>
            <View style={styles.appointmentDetail}>
              <Ionicons name="person" size={24} color="#7E3AF2" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Healthcare Provider</Text>
                <Text style={styles.detailValue}>{provider.name}</Text>
              </View>
            </View>

            <View style={styles.appointmentDetail}>
              <Ionicons name="calendar" size={24} color="#7E3AF2" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {formatDate(appointmentDate)} at {appointmentTime}
                </Text>
              </View>
            </View>

            <View style={styles.appointmentDetail}>
              <Ionicons name="medical" size={24} color="#7E3AF2" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Reason for Visit</Text>
                <Text style={styles.detailValue}>{reason}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('MainLayout')}
        >
          <Text style={styles.buttonText}>Return to Home</Text>
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
    alignItems: 'flex-end',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  successIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  appointmentCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  appointmentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailText: {
    marginLeft: 16,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  button: {
    backgroundColor: '#7E3AF2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AppointmentConfirmation; 