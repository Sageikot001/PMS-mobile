import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorTabNavigator from './DoctorTabNavigator'; // Your existing bottom tabs
import PatientDetailsScreen from '../screens/doctor/PatientDetailsScreen';
import ConsultationScreen from '../screens/doctor/ConsultationScreen';
import PrescriptionScreen from '../screens/doctor/PrescriptionScreen';
import PrescriptionQueueScreen from '../screens/doctor/PrescriptionQueueScreen';
import PatientSelectionScreen from '../screens/doctor/PatientSelectionScreen';
import PrescriptionPreviewScreen from '../screens/doctor/PrescriptionPreviewScreen';
import MessagesScreen from '../screens/doctor/MessagesScreen';
import DoctorAppointmentsScreen from '../screens/doctor/AppointmentsScreen';
import AppointmentDetailsScreen from '../screens/doctor/AppointmentDetailsScreen';
import ChatListScreen from '../screens/doctor/ChatListScreen';
import ChatScreen from '../screens/doctor/ChatScreen';
import NotificationsScreen from '../screens/doctor/NotificationsScreen';
import AIChatScreen from '../screens/doctor/AIChatScreen';
// Import other doctor-specific detail screens here as they are created
// e.g., PrescriptionScreen, AppointmentDetailScreen

const Stack = createNativeStackNavigator();

const DoctorMainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#2C3E50',
        headerBackTitleVisible: false,
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
        })} 
      />
      <Stack.Screen 
        name="Consultation" 
        component={ConsultationScreen} 
        options={{ 
          title: 'Live Consultation',
          headerShown: false, // Consultation has its own header
        }} 
      />
      <Stack.Screen 
        name="PrescriptionQueue" 
        component={PrescriptionQueueScreen} 
        options={{ 
          title: 'Prescription Queue',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="PatientSelection" 
        component={PatientSelectionScreen} 
        options={{ 
          title: 'Select Patient',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="Prescription" 
        component={PrescriptionScreen} 
        options={{ 
          title: 'Write Prescription',
          headerShown: false, // Prescription has its own header
        }} 
      />
      <Stack.Screen 
        name="PrescriptionPreview" 
        component={PrescriptionPreviewScreen} 
        options={{ 
          title: 'Prescription Preview',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="Messages" 
        component={MessagesScreen} 
        options={{ 
          title: 'Messages',
          headerShown: false, // Messages has its own header
        }} 
      />
      <Stack.Screen 
        name="Appointments" 
        component={DoctorAppointmentsScreen} 
        options={{ 
          title: 'Appointments',
        }} 
      />
      <Stack.Screen 
        name="AppointmentDetails" 
        component={AppointmentDetailsScreen} 
        options={{ 
          title: 'Appointment Details',
          headerShown: false, // AppointmentDetails has its own header
        }} 
      />
      <Stack.Screen 
        name="ChatListScreen" 
        component={ChatListScreen} 
        options={{ 
          title: 'Messages',
          headerShown: false, // ChatListScreen has its own header
        }} 
      />
      <Stack.Screen 
        name="ChatScreen" 
        component={ChatScreen} 
        options={{ 
          title: 'Chat',
          headerShown: false, // ChatScreen has its own header
        }} 
      />
      <Stack.Screen 
        name="NotificationsScreen" 
        component={NotificationsScreen} 
        options={{ 
          title: 'Notifications',
          headerShown: false, // NotificationsScreen has its own header
        }} 
      />
      <Stack.Screen 
        name="AIChatScreen" 
        component={AIChatScreen} 
        options={{ 
          title: 'Medical AI Assistant',
          headerShown: false, // AIChatScreen has its own header
        }} 
      />
      {/* Add other detail screens here */}
      {/* <Stack.Screen name="Prescription" component={PrescriptionScreen} /> */}
    </Stack.Navigator>
  );
};

export default DoctorMainStack; 