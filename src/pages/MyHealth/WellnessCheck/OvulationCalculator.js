import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

import OvulationCalendar from '../../../components/OvulationCalendar';
import OvulationTracker from '../../../components/OvulationTracker';
import { HealthDataService, WELLNESS_CALCULATION_TYPES } from '../../../lib/api';

const OvulationCalculator = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [cycleData, setCycleData] = useState({
    lastPeriodDate: new Date(),
    cycleLength: 28,
    regularity: 'very_regular', // very_regular, somewhat_regular, irregular
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const renderWelcomeScreen = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Plan your baby making 😉</Text>
      <Text style={styles.subtitle}>
        It takes two to tango, but our ovulation checker can help you plan the perfect dance party! 
        Get in sync with your body and start your baby-making journey today or not
      </Text>
      
      {/* <Image 
        source={ ('../../../../assets/images/ovulation-calendar.png')}
        style={styles.illustration}
      /> */}

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Learn more about ovulation and how to track it by visiting The American College of Obstetricians and Gynecologists
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentStep(2)}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLastPeriodInput = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>When was your last period?</Text>
      <Text style={styles.subtitle}>
        This helps us calculate your fertile window more accurately
      </Text>

      <TouchableOpacity 
        style={styles.dateButton}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateButtonText}>
          {cycleData.lastPeriodDate.toLocaleDateString()}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={cycleData.lastPeriodDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setCycleData({...cycleData, lastPeriodDate: selectedDate});
            }
          }}
        />
      )}

      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentStep(3)}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCycleLengthInput = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>How long is your cycle?</Text>
      <Text style={styles.subtitle}>
        Count from the first day of one period to the first day of the next
      </Text>

      <View style={styles.cycleLengthOptions}>
        {[28, 30, 32].map((length) => (
          <TouchableOpacity
            key={length}
            style={[
              styles.cycleLengthButton,
              cycleData.cycleLength === length && styles.selectedLength
            ]}
            onPress={() => setCycleData({...cycleData, cycleLength: length})}
          >
            <Text style={[
              styles.cycleLengthText,
              cycleData.cycleLength === length && styles.selectedLengthText
            ]}>
              {length} days
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => setCurrentStep(4)}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCycleRegularity = () => (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => setCurrentStep(currentStep - 1)}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>How regular are your periods?</Text>
      <Text style={styles.subtitle}>
        This helps us provide more accurate predictions
      </Text>

      <View style={styles.regularityOptions}>
        {[
          {
            id: 'very_regular',
            title: 'Very regular',
            description: 'Cycle length usually the same'
          },
          {
            id: 'somewhat_regular',
            title: 'Somewhat regular',
            description: 'Cycle length varies by a few days'
          },
          {
            id: 'irregular',
            title: 'Irregular',
            description: 'Cycle length varies significantly'
          }
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.regularityButton,
              cycleData.regularity === option.id && styles.selectedRegularity
            ]}
            onPress={() => {
              setCycleData({...cycleData, regularity: option.id});
              setCurrentStep(5);
            }}
          >
            <Text style={[
              styles.regularityTitle,
              cycleData.regularity === option.id && styles.selectedRegularityText
            ]}>
              {option.title}
            </Text>
            <Text style={[
              styles.regularityDescription,
              cycleData.regularity === option.id && styles.selectedRegularityText
            ]}>
              {option.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const saveOvulationCalculation = async () => {
    try {
      const ovulationDay = new Date(cycleData.lastPeriodDate);
      ovulationDay.setDate(ovulationDay.getDate() + cycleData.cycleLength - 14);

      const fertileWindowStart = new Date(ovulationDay);
      const fertileWindowEnd = new Date(ovulationDay);

      // Adjust fertile window based on regularity
      switch(cycleData.regularity) {
        case 'very_regular':
          fertileWindowStart.setDate(ovulationDay.getDate() - 5);
          break;
        case 'somewhat_regular':
          fertileWindowStart.setDate(ovulationDay.getDate() - 7);
          break;
        case 'irregular':
          fertileWindowStart.setDate(ovulationDay.getDate() - 9);
          break;
      }

      const nextPeriod = new Date(cycleData.lastPeriodDate);
      nextPeriod.setDate(nextPeriod.getDate() + cycleData.cycleLength);

      const inputData = {
        lastPeriodDate: cycleData.lastPeriodDate.toISOString(),
        cycleLength: cycleData.cycleLength,
        regularity: cycleData.regularity,
      };

      const results = {
        ovulationDate: ovulationDay.toISOString(),
        fertileWindowStart: fertileWindowStart.toISOString(),
        fertileWindowEnd: fertileWindowEnd.toISOString(),
        nextPeriodDate: nextPeriod.toISOString(),
        calculatedAt: new Date().toISOString(),
      };

      const calculationData = {
        input: inputData,
        results: results,
      };

      await HealthDataService.saveWellnessCalculation(
        WELLNESS_CALCULATION_TYPES.OVULATION, 
        calculationData
      );

      setIsSaved(true);
      
      Alert.alert(
        'Success',
        'Ovulation calculation saved successfully!\n\nYour cycle data has been added to your health profile for tracking.',
        [
          { text: 'OK', onPress: () => {} },
          { 
            text: 'View Health Profile', 
            onPress: () => navigation.navigate('MyHealth') 
          }
        ]
      );
    } catch (error) {
      console.error('Error saving ovulation calculation:', error);
      Alert.alert('Error', 'Failed to save calculation. Please try again.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return renderWelcomeScreen();
      case 2:
        return renderLastPeriodInput();
      case 3:
        return renderCycleLengthInput();
      case 4:
        return renderCycleRegularity();
      case 5:
        return (
          <View style={styles.container}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Your Fertility Calendar</Text>
            <Text style={styles.subtitle}>
              Based on your cycle information, here's your personalized fertility calendar
            </Text>

            <OvulationCalendar cycleData={cycleData} />
            <OvulationTracker />

            {!isSaved && (
              <TouchableOpacity style={styles.saveButton} onPress={saveOvulationCalculation}>
                <Text style={styles.saveButtonText}>💾 Save to Health Profile</Text>
              </TouchableOpacity>
            )}

            {isSaved && (
              <View style={styles.savedIndicator}>
                <Text style={styles.savedText}>✅ Saved to your health profile</Text>
              </View>
            )}

            <View style={styles.reminderCard}>
              <Text style={styles.reminderTitle}>📱 Track Daily</Text>
              <Text style={styles.reminderText}>
                For better accuracy, track your daily symptoms, temperature, and other fertility signs
              </Text>
            </View>
          </View>
        );
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
  infoBox: {
    backgroundColor: '#E8F4FE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  infoText: {
    color: '#0066CC',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 32,
  },
  dateButtonText: {
    fontSize: 18,
    color: '#333',
  },
  cycleLengthOptions: {
    gap: 16,
    marginBottom: 32,
  },
  cycleLengthButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedLength: {
    backgroundColor: '#6200ee',
  },
  cycleLengthText: {
    fontSize: 16,
    color: '#333',
  },
  selectedLengthText: {
    color: '#fff',
  },
  regularityOptions: {
    gap: 16,
    marginTop: 16,
  },
  regularityButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  selectedRegularity: {
    backgroundColor: '#6200ee',
  },
  regularityTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  regularityDescription: {
    fontSize: 14,
    color: '#666',
  },
  selectedRegularityText: {
    color: '#fff',
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
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  savedText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  reminderCard: {
    backgroundColor: '#F0F7F8',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  reminderText: {
    fontSize: 14,
    color: '#666',
  },
});

export default OvulationCalculator; 