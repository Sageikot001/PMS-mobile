import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ConsultationActions from '../../../components/ConsultationActions';
import HealthDataService, { WELLNESS_CALCULATION_TYPES, HEALTH_METRIC_TYPES } from '../../../services/HealthDataService';
import HealthActivityService, { ACTIVITY_TYPES } from '../../../services/HealthActivityService';

const BMICalculator = () => {
  const navigation = useNavigation();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBMI] = useState(null);
  const [category, setCategory] = useState('');
  const [useMetric, setUseMetric] = useState(true);
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Record activity when component mounts
  useEffect(() => {
    HealthActivityService.recordActivity(
      ACTIVITY_TYPES.WELLNESS_CALC, 
      'BMICalculator',
      { calcType: 'bmi', calcName: 'BMI Calculator' }
    );
  }, []);

  const toggleUnit = () => {
    setUseMetric(!useMetric);
    // Clear inputs when switching units
    setHeight('');
    setWeight('');
    setFeet('');
    setInches('');
    setBMI(null);
    setCategory('');
    setIsSaved(false);
  };

  const calculateBMI = () => {
    setIsCalculating(true);
    
    let heightInMeters;
    let weightInKg;
    let heightInCm;

    if (useMetric) {
      heightInCm = parseFloat(height);
      heightInMeters = heightInCm / 100;
      weightInKg = parseFloat(weight);
    } else {
      // Convert feet and inches to meters and cm
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightInMeters = totalInches * 0.0254;
      heightInCm = totalInches * 2.54;
      // Convert pounds to kg
      weightInKg = parseFloat(weight) * 0.453592;
    }

    if ((useMetric && height && weight) || (!useMetric && feet && inches && weight)) {
      const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      setBMI(bmiValue);
      
      let categoryText = '';
      if (bmiValue < 18.5) {
        categoryText = 'Underweight';
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        categoryText = 'Normal weight';
      } else if (bmiValue >= 25 && bmiValue < 30) {
        categoryText = 'Overweight';
      } else {
        categoryText = 'Obese';
      }
      
      setCategory(categoryText);
      setIsSaved(false); // Reset saved status when recalculating
    }
    
    setIsCalculating(false);
  };

  const saveBMICalculation = async () => {
    if (!bmi || !category) {
      Alert.alert('Error', 'Please calculate BMI first');
      return;
    }

    try {
      setIsCalculating(true);
      
      // Prepare input data
      const inputData = {
        weight: useMetric ? weight : weight,
        weightUnit: useMetric ? 'kg' : 'lbs',
        height: useMetric ? height : `${feet}'${inches}"`,
        heightInCm: useMetric ? parseFloat(height) : ((parseFloat(feet) * 12) + parseFloat(inches)) * 2.54,
        weightInKg: useMetric ? parseFloat(weight) : parseFloat(weight) * 0.453592,
        useMetric: useMetric,
      };

      if (!useMetric) {
        inputData.feet = feet;
        inputData.inches = inches;
      }

      const results = {
        bmi: parseFloat(bmi),
        category: category,
        calculatedAt: new Date().toISOString(),
      };

      const calculationData = {
        input: inputData,
        results: results,
      };

      // Save wellness calculation
      await HealthDataService.saveWellnessCalculation(
        WELLNESS_CALCULATION_TYPES.BMI, 
        calculationData
      );

      // Also store individual height and weight metrics for tracking
      await HealthDataService.addHealthMetric(HEALTH_METRIC_TYPES.HEIGHT, {
        value: inputData.heightInCm.toFixed(1),
        unit: 'cm',
        source: 'bmi_calculator',
        notes: 'Recorded via BMI Calculator',
      });

      await HealthDataService.addHealthMetric(HEALTH_METRIC_TYPES.WEIGHT, {
        value: inputData.weightInKg.toFixed(1),
        unit: 'kg',
        source: 'bmi_calculator',
        notes: 'Recorded via BMI Calculator',
      });

      // BMI will be automatically calculated and stored by the HealthDataService

      setIsSaved(true);
      
      Alert.alert(
        'Success',
        `BMI calculation saved successfully!\n\nYour BMI: ${bmi}\nCategory: ${category}\n\nYour height and weight have also been added to your health metrics.`,
        [
          { text: 'OK', onPress: () => {} },
          { 
            text: 'View Health Metrics', 
            onPress: () => navigation.navigate('MyHealth') 
          }
        ]
      );
    } catch (error) {
      console.error('Error saving BMI calculation:', error);
      Alert.alert('Error', 'Failed to save BMI calculation. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const getRecommendation = () => {
    if (!category) return '';
    
    switch (category) {
      case 'Underweight':
        return 'Consider consulting with a healthcare provider about healthy weight gain strategies through balanced nutrition and exercise.';
      case 'Normal weight':
        return 'Excellent! You are at a healthy weight. Maintain a balanced diet and regular exercise routine to keep it up.';
      case 'Overweight':
        return 'Consider consulting with a healthcare provider about healthy weight management through diet and exercise.';
      case 'Obese':
        return 'We recommend consulting with a healthcare provider about a comprehensive weight management plan.';
      default:
        return '';
    }
  };

  const getBMIColor = () => {
    if (!category) return '#007bff';
    
    switch (category) {
      case 'Underweight': return '#ff9800';
      case 'Normal weight': return '#4caf50';
      case 'Overweight': return '#ff9800';
      case 'Obese': return '#f44336';
      default: return '#007bff';
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.title}>BMI Calculator</Text>
        <Text style={styles.subtitle}>
          Calculate your Body Mass Index to check if you're at a healthy weight
        </Text>

        <TouchableOpacity 
          style={styles.unitToggle}
          onPress={toggleUnit}
        >
          <Text style={styles.unitToggleText}>
            Switch to {useMetric ? 'Imperial' : 'Metric'}
          </Text>
        </TouchableOpacity>

        {useMetric ? (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="Enter height in cm"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Enter weight in kg"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Height</Text>
              <View style={styles.imperialHeightContainer}>
                <TextInput
                  style={[styles.input, styles.imperialInput]}
                  value={feet}
                  onChangeText={setFeet}
                  keyboardType="numeric"
                  placeholder="Feet"
                  placeholderTextColor="#999"
                />
                <Text style={styles.imperialSeparator}>ft</Text>
                <TextInput
                  style={[styles.input, styles.imperialInput]}
                  value={inches}
                  onChangeText={setInches}
                  keyboardType="numeric"
                  placeholder="Inches"
                  placeholderTextColor="#999"
                />
                <Text style={styles.imperialSeparator}>in</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Enter weight in lbs"
                placeholderTextColor="#999"
              />
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={[styles.calculateButton, isCalculating && styles.disabledButton]} 
          onPress={calculateBMI}
          disabled={isCalculating}
        >
          <Text style={styles.calculateButtonText}>
            {isCalculating ? 'Calculating...' : 'Calculate BMI'}
          </Text>
        </TouchableOpacity>

        {bmi && (
          <View style={styles.resultContainer}>
            <View style={[styles.bmiValue, { borderColor: getBMIColor() }]}>
              <Text style={[styles.bmiNumber, { color: getBMIColor() }]}>{bmi}</Text>
              <Text style={styles.bmiLabel}>Your BMI</Text>
            </View>
            
            <Text style={styles.categoryText}>
              You are in the <Text style={[styles.categoryHighlight, { color: getBMIColor() }]}>{category}</Text> range
            </Text>

            <View style={styles.scaleContainer}>
              <View style={styles.scale}>
                <View style={[
                  styles.scaleIndicator,
                  { 
                    left: `${Math.min(Math.max((bmi / 40) * 100, 0), 100)}%`,
                    backgroundColor: getBMIColor()
                  }
                ]} />
                <View style={styles.scaleMarkers}>
                  <Text style={styles.scaleText}>Underweight</Text>
                  <Text style={styles.scaleText}>Normal</Text>
                  <Text style={styles.scaleText}>Overweight</Text>
                  <Text style={styles.scaleText}>Obese</Text>
                </View>
              </View>
            </View>

            <Text style={styles.recommendationTitle}>What does this mean?</Text>
            <Text style={styles.recommendationText}>
              {getRecommendation()}
            </Text>

            {!isSaved && (
              <TouchableOpacity 
                style={[styles.saveButton, isCalculating && styles.disabledButton]} 
                onPress={saveBMICalculation}
                disabled={isCalculating}
              >
                <Text style={styles.saveButtonText}>
                  {isCalculating ? 'Saving...' : '💾 Save to Health Profile'}
                </Text>
              </TouchableOpacity>
            )}

            {isSaved && (
              <View style={styles.savedIndicator}>
                <Text style={styles.savedText}>✅ Saved to your health profile</Text>
              </View>
            )}

            <ConsultationActions />
          </View>
        )}
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  unitToggle: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  unitToggleText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  imperialHeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imperialInput: {
    flex: 1,
    marginRight: 8,
  },
  imperialSeparator: {
    fontSize: 16,
    color: '#666',
    marginRight: 12,
  },
  calculateButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultContainer: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  bmiValue: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 3,
    backgroundColor: '#fff',
  },
  bmiNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bmiLabel: {
    fontSize: 16,
    color: '#666',
  },
  categoryText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  categoryHighlight: {
    fontWeight: 'bold',
  },
  scaleContainer: {
    width: '100%',
    marginBottom: 24,
  },
  scale: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 12,
  },
  scaleIndicator: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007bff',
  },
  scaleMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  recommendationText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#4caf50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedIndicator: {
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  savedText: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BMICalculator; 