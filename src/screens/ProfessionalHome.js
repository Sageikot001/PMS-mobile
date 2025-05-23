import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const ProfessionalHome = ({ route }) => {
  const navigation = useNavigation();
  const { professional } = route.params;

  const menuItems = [
    {
      title: 'Appointments',
      icon: '📅',
      description: 'Manage your appointments and schedule',
      screen: 'Appointments',
    },
    {
      title: 'Patients',
      icon: '👥',
      description: 'View and manage patient records',
      screen: 'Patients',
    },
    {
      title: 'Prescriptions',
      icon: '💊',
      description: 'Write and manage prescriptions',
      screen: 'Prescriptions',
    },
    {
      title: 'Profile',
      icon: '👤',
      description: 'View and edit your profile',
      screen: 'Profile',
    },
    {
      title: 'Settings',
      icon: '⚙️',
      description: 'App settings and preferences',
      screen: 'Settings',
    },
  ];

  // If the professional is a doctor, navigate to the DoctorMainStack
  useEffect(() => {
    if (professional?.type === 'doctor') {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'DoctorApp', params: { professional } },
        ],
      });
    } else if (professional?.type === 'pharmacist') {
      // TODO: Navigate to Pharmacist specific app stack or home screen
      // For now, can navigate to a placeholder or a generic dashboard
      // navigation.navigate('PharmacistHome', { professional });
      console.log('Pharmacist logged in, no specific home screen yet.');
      // Potentially navigate to a generic settings or profile screen, or back to Onboarding/Login
      // navigation.navigate('Login'); // Example, adjust as needed
    } else {
      // Handle other types or navigate to a default screen
      console.log('Unknown professional type or no type specified.');
      // navigation.navigate('Login'); // Example
    }
  }, [professional, navigation]);

  return null;
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
    backgroundColor: '#F8F9FA',
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
  roleText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileButtonText: {
    fontSize: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 5,
    textAlign: 'center',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  menuDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 24,
    color: '#7F8C8D',
    marginLeft: 10,
  },
});

export default ProfessionalHome; 