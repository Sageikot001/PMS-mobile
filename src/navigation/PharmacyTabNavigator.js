import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import PharmacyHomeScreen from '../screens/pharmacy/PharmacyHomeScreen';
import InventoryScreen from '../screens/pharmacy/InventoryScreen';
import PharmacyPrescriptionQueue from '../screens/pharmacy/PharmacyPrescriptionQueue';
import OrdersScreen from '../screens/pharmacy/OrdersScreen';
import PharmacyProfileScreen from '../screens/pharmacy/PharmacyProfileScreen';

const Tab = createBottomTabNavigator();
const ACCENT = '#00897B';

const PharmacyTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
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
            case 'Inventory':
              return <Ionicons name="cube-outline" size={size} color={color} />;
            case 'Prescriptions':
              return <Ionicons name="document-text-outline" size={size} color={color} />;
            case 'Orders':
              return <Ionicons name="cart-outline" size={size} color={color} />;
            case 'Profile':
              return <Ionicons name="person-outline" size={size} color={color} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Home" component={PharmacyHomeScreen} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Prescriptions" component={PharmacyPrescriptionQueue} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Profile" component={PharmacyProfileScreen} />
    </Tab.Navigator>
  );
};

export default PharmacyTabNavigator;
