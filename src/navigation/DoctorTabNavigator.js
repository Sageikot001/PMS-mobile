import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DoctorHomeScreen from '../screens/doctor/HomeScreen';
import DoctorPatientsScreen from '../screens/doctor/PatientsScreen';
import DoctorAppointmentsScreen from '../screens/doctor/AppointmentsScreen';
import DoctorEarningsScreen from '../screens/doctor/EarningsScreen';
import DoctorProfileScreen from '../screens/doctor/ProfileScreen';

const Tab = createBottomTabNavigator();

const DoctorTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#4A90E2',
        tabBarInactiveTintColor: '#7F8C8D',
        tabBarStyle: { 
          backgroundColor: '#fff', 
          borderTopWidth: 0.5, 
          borderTopColor: '#E9ECEF',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIcon: ({ color, size }) => {
          switch (route.name) {
            case 'Home':
              return <Ionicons name="home-outline" size={size} color={color} />;
            case 'Patients':
              return <Ionicons name="people-outline" size={size} color={color} />;
            case 'Appointments':
              return <Ionicons name="calendar-outline" size={size} color={color} />;
            case 'Earnings':
              return <Ionicons name="cash-outline" size={size} color={color} />;
            case 'Profile':
              return <Ionicons name="person-outline" size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={DoctorHomeScreen} />
      <Tab.Screen name="Patients" component={DoctorPatientsScreen} />
      <Tab.Screen name="Appointments" component={DoctorAppointmentsScreen} />
      <Tab.Screen name="Earnings" component={DoctorEarningsScreen} />
      <Tab.Screen name="Profile" component={DoctorProfileScreen} />
    </Tab.Navigator>
  );
};

export default DoctorTabNavigator; 