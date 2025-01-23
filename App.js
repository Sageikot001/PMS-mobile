import { useState } from 'react';
import { StyleSheet, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import pages
import Home from './src/pages/Home/Home';
import Orders from './src/pages/Orders/Orders';
import MyHealth from './src/pages/MyHealth/MyHealth';
import Wallet from './src/pages/Wallet/Wallet';
import Account from './src/pages/Account/Account';
import Categories from './src/pages/Categories/Categories';
import BottomNav from './src/components/navigation/BottomNav';
import PharmacyDetail from './src/pages/PharmacyDetail/PharmacyDetail';
import HealthMetricDetail from './src/pages/MyHealth/HealthMetricDetail';
import MedicationManagement from './src/pages/MyHealth/MedicationManagement/MedicationManagement';
import AddMedication from './src/pages/MyHealth/MedicationManagement/AddMedication';
import DosageSchedule from './src/pages/MyHealth/MedicationManagement/DosageSchedule';
import ConditionManagement from './src/pages/MyHealth/ConditionManagement/ConditionManagement';
import AddCondition from './src/pages/MyHealth/ConditionManagement/AddCondition';
import ConditionDrugs from './src/pages/MyHealth/ConditionManagement/ConditionDrugs';
import DrugProfile from './src/pages/MyHealth/ConditionManagement/DrugProfile';
import WellnessCheck from './src/pages/MyHealth/WellnessCheck/WellnessCheck';
import BMICalculator from './src/pages/MyHealth/WellnessCheck/BMICalculator';
import PharmacistConsult from './src/pages/Consultations/PharmacistConsult';
import DoctorConsult from './src/pages/Consultations/DoctorConsult';
import OrderDrugs from './src/pages/Pharmacy/OrderDrugs';
import ConsultationHome from './src/pages/Consultations/ConsultationHome';
import HealthcareProfessionals from './src/pages/Consultations/HealthcareProfessionals';
import ProfessionalProfile from './src/pages/Consultations/ProfessionalProfile';

const Stack = createNativeStackNavigator();

const MainLayout = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Home navigation={navigation} />;
      case 'orders':
        return <Orders />;
      case 'myhealth':
        return <MyHealth />;
      case 'wallet':
        return <Wallet />;
      case 'account':
        return <Account />;
      default:
        return <Home navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="MainLayout" component={MainLayout} />
          <Stack.Screen name="Categories" component={Categories} />
          <Stack.Screen name="PharmacyDetail" component={PharmacyDetail} />
          <Stack.Screen name="HealthMetricDetail" component={HealthMetricDetail} />
          <Stack.Screen name="MedicationManagement" component={MedicationManagement} />
          <Stack.Screen name="AddMedication" component={AddMedication} />
          <Stack.Screen name="DosageSchedule" component={DosageSchedule} />
          <Stack.Screen name="ConditionManagement" component={ConditionManagement} />
          <Stack.Screen name="AddCondition" component={AddCondition} />
          <Stack.Screen name="ConditionDrugs" component={ConditionDrugs} />
          <Stack.Screen name="DrugProfile" component={DrugProfile} />
          <Stack.Screen name="WellnessCheck" component={WellnessCheck} />
          <Stack.Screen name="BMICalculator" component={BMICalculator} />
          <Stack.Screen name="PharmacistConsult" component={PharmacistConsult} />
          <Stack.Screen name="DoctorConsult" component={DoctorConsult} />
          <Stack.Screen name="OrderDrugs" component={OrderDrugs} />
          <Stack.Screen name="ConsultationHome" component={ConsultationHome} />
          <Stack.Screen name="HealthcareProfessionals" component={HealthcareProfessionals} />
          <Stack.Screen name="ProfessionalProfile" component={ProfessionalProfile} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});
