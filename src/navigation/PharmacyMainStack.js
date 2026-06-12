import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PharmacyTabNavigator from './PharmacyTabNavigator';
import AddInventoryItem from '../screens/pharmacy/AddInventoryItem';
import PrescriptionDetailScreen from '../screens/pharmacy/PrescriptionDetailScreen';
import OrderDetailScreen from '../screens/pharmacy/OrderDetailScreen';
import PharmacyAnalyticsScreen from '../screens/pharmacy/PharmacyAnalyticsScreen';

const Stack = createNativeStackNavigator();

const PharmacyMainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#2C3E50',
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="PharmacyAppTabs"
        component={PharmacyTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddInventoryItem"
        component={AddInventoryItem}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrescriptionDetail"
        component={PrescriptionDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PharmacyAnalytics"
        component={PharmacyAnalyticsScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default PharmacyMainStack;
