import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import ForgotPassword from '../pages/Auth/ForgotPassword';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfessionalOnboarding from '../screens/ProfessionalOnboarding';
import InstitutionOnboarding from '../screens/InstitutionOnboarding';
import ProfessionalHome from '../screens/ProfessionalHome';
import DoctorMainStack from './DoctorMainStack';
import { ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  const { isBootstrapping } = useContext(AuthContext);

  if (isBootstrapping) {
    return <ActivityIndicator />;
  }

  return (
    <Stack.Navigator
      initialRouteName='Onboarding'
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name='Onboarding' component={OnboardingScreen} />
      <Stack.Screen
        name='ProfessionalOnboarding'
        component={ProfessionalOnboarding}
      />
      <Stack.Screen
        name='InstitutionOnboarding'
        component={InstitutionOnboarding}
      />
      <Stack.Screen name='ProfessionalHome' component={ProfessionalHome} />
      <Stack.Screen name='DoctorApp' component={DoctorMainStack} />
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='Register' component={Register} />
      <Stack.Screen name='ForgotPassword' component={ForgotPassword} />
    </Stack.Navigator>
  );
};

export default AuthStack;
