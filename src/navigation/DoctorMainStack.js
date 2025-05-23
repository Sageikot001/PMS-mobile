import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorTabNavigator from './DoctorTabNavigator'; // Your existing bottom tabs
import PatientDetailsScreen from '../screens/doctor/PatientDetailsScreen';
// Import other doctor-specific detail screens here as they are created
// e.g., PrescriptionScreen, AppointmentDetailScreen

const Stack = createNativeStackNavigator();

const DoctorMainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        // headerShown: false, // Hide header for TabNavigator, show for others
        // animation: 'slide_from_right',
      })}
    >
      <Stack.Screen 
        name="DoctorAppTabs" 
        component={DoctorTabNavigator} 
        options={{ headerShown: false }} // Tabs handle their own headers or no header
      />
      <Stack.Screen 
        name="PatientDetails" 
        component={PatientDetailsScreen} 
        options={({ route }) => ({ 
          title: route.params?.patientName || 'Patient Details', // Dynamic title
          headerBackTitleVisible: false,
          headerTintColor: '#2C3E50',
          headerStyle: { backgroundColor: '#FFFFFF' },
        })} 
      />
      {/* Add other detail screens here */}
      {/* <Stack.Screen name="Prescription" component={PrescriptionScreen} /> */}
    </Stack.Navigator>
  );
};

export default DoctorMainStack; 