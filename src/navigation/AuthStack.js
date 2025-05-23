import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Auth Screens
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';

// Import Onboarding Screens
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfessionalOnboarding from '../screens/ProfessionalOnboarding';
import InstitutionOnboarding from '../screens/InstitutionOnboarding';

// Import Professional Screens
import ProfessionalHome from '../screens/ProfessionalHome';
import DoctorMainStack from './DoctorMainStack';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ProfessionalOnboarding" component={ProfessionalOnboarding} />
      <Stack.Screen name="InstitutionOnboarding" component={InstitutionOnboarding} />
      <Stack.Screen name="ProfessionalHome" component={ProfessionalHome} />
      <Stack.Screen name="DoctorApp" component={DoctorMainStack} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Register" component={Register} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack; 