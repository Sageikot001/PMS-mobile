import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import WeightInput from '../../../components/WeightInput';
import HeightInput from '../../../components/HeightInput';
import ActivityLevelSelector from '../../../components/ActivityLevelSelector';
import CalorieResults from '../../../components/CalorieResults';
import { HealthDataService, WELLNESS_CALCULATION_TYPES } from '../../../lib/api';

const CalorieCalculator = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    weight: '',
    height: '',
    age: '',
    gender: 'female', // default value
    activityLevel: '',
    weightUnit: 'Kg',
    heightUnit: 'Cm'
  });
  const [calculationResults, setCalculationResults] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Know your calorie limits</Text>
      <Text style={styles.subtitle}>
        Want to reduce, maintain or gain weights?, our calorie checker guides you to your daily intake for calories
      </Text>
      
      {/* <Image 
        source={ ('../../../../assets/icons/calorie-illustration.png')}
        style={styles.illustration}
      /> */}

      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGenderSelect = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>What is your gender?</Text>
      
      <View style={styles.genderContainer}>
        <TouchableOpacity 
          style={[
            styles.genderButton,
            userData.gender === 'female' && styles.selectedGender
          ]}
          onPress={() => {
            setUserData({...userData, gender: 'female'});
            setCurrentStep(3);
          }}
        >
          <Text style={[
            styles.genderText,
            userData.gender === 'female' && styles.selectedGenderText
          ]}>Female</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.genderButton,
            userData.gender === 'male' && styles.selectedGender
          ]}
          onPress={() => {
            setUserData({...userData, gender: 'male'});
            setCurrentStep(3);
          }}
        >
          <Text style={[
            styles.genderText,
            userData.gender === 'male' && styles.selectedGenderText
          ]}>Male</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderWeightInput = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>What is your current weight?</Text>
      
      <WeightInput
        value={userData.weight}
        onChange={(value) => setUserData({...userData, weight: value})}
        onContinue={() => setCurrentStep(4)}
      />
    </View>
  );

  const renderHeightInput = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>How tall are you?</Text>
      
      <HeightInput
        value={userData.height}
        onChange={(value) => setUserData({...userData, height: value})}
        onContinue={() => setCurrentStep(5)}
      />
    </View>
  );

  const renderAgeInput = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>What is your age?</Text>
      
      <TextInput
        style={styles.ageInput}
        value={userData.age}
        onChangeText={(value) => setUserData({...userData, age: value})}
        keyboardType="numeric"
        placeholder="25"
        placeholderTextColor="#999"
      />

      <TouchableOpacity 
        style={[styles.continueButton, !userData.age && styles.disabledButton]}
        onPress={() => setCurrentStep(6)}
        disabled={!userData.age}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderActivityLevel = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Generally, how active are you during the week</Text>
      
      <ActivityLevelSelector
        value={userData.activityLevel}
        onChange={(value) => {
          setUserData({...userData, activityLevel: value});
          setCurrentStep(7);
        }}
      />
    </View>
  );

  const renderResults = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Your result</Text>
      <Text style={styles.subtitle}>
        Depending on your goals, here are the different calorie intake per day to guide you
      </Text>

      <CalorieResults 
        userData={userData} 
        onResultsCalculated={(results) => setCalculationResults(results)}
      />
      
      {!isSaved && calculationResults && (
        <TouchableOpacity style={styles.saveButton} onPress={saveCalorieCalculation}>
          <Text style={styles.saveButtonText}>💾 Save to Health Profile</Text>
        </TouchableOpacity>
      )}

      {isSaved && (
        <View style={styles.savedIndicator}>
          <Text style={styles.savedText}>✅ Saved to your health profile</Text>
        </View>
      )}
      
      <TouchableOpacity style={styles.consultCard}>
        <View style={styles.consultContent}>
          {/* <Image
            source={ ('../../../../assets/icons/pharmacist-avatar.png')}
            style={styles.avatar}
          /> */}
          <View style={styles.textContainer}>
            <Text style={styles.consultTitle}>Talk to a Pharmacist</Text>
            <Text style={styles.consultDescription}>
              If you wish to loose, gain or maintain weight, speak with an expert to guide you through your journey
            </Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.consultButton}
          onPress={() => navigation.navigate('PharmacistConsult')}
        >
          <Text style={styles.consultButtonText}>Book a consultation</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );

  const saveCalorieCalculation = async () => {
    if (!calculationResults) {
      Alert.alert('Error', 'No calculation results to save');
      return;
    }

    try {
      const inputData = {
        weight: userData.weight,
        weightUnit: userData.weightUnit,
        height: userData.height,
        heightUnit: userData.heightUnit,
        age: userData.age,
        gender: userData.gender,
        activityLevel: userData.activityLevel,
      };

      const results = {
        ...calculationResults,
        calculatedAt: new Date().toISOString(),
      };

      const calculationData = {
        input: inputData,
        results: results,
      };

      await HealthDataService.saveWellnessCalculation(
        WELLNESS_CALCULATION_TYPES.CALORIE, 
        calculationData
      );

      setIsSaved(true);
      
      Alert.alert(
        'Success',
        'Calorie calculation saved successfully!\n\nYour weight and other health metrics have also been updated in your profile.',
        [
          { text: 'OK', onPress: () => {} },
          { 
            text: 'View Health Profile', 
            onPress: () => navigation.navigate('MyHealth') 
          }
        ]
      );
    } catch (error) {
      console.error('Error saving calorie calculation:', error);
      Alert.alert('Error', 'Failed to save calculation. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderWelcomeScreen();
      case 2:
        return renderGenderSelect();
      case 3:
        return renderWeightInput();
      case 4:
        return renderHeightInput();
      case 5:
        return renderAgeInput();
      case 6:
        return renderActivityLevel();
      case 7:
        return renderResults();
      default:
        return renderWelcomeScreen();
    }
  };

  return (
    <ScrollView style={styles.scrollView}>
      {renderStep()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  closeButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    fontSize: 32,
    color: '#333',
  },
  backButton: {
    padding: 8,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  illustration: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginVertical: 32,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  consultSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginTop: 32,
  },
  consultContent: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  consultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  consultDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  consultButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  consultButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedGender: {
    backgroundColor: '#6200ee',
  },
  genderText: {
    fontSize: 16,
    color: '#333',
  },
  selectedGenderText: {
    color: '#fff',
  },
  ageInput: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    marginTop: 32,
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedIndicator: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  savedText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '600',
  },
  consultCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginTop: 32,
  },
});

export default CalorieCalculator; 