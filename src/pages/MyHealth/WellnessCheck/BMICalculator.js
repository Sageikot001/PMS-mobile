import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ConsultationActions from '../../../components/ConsultationActions';

const BMICalculator = () => {
  const navigation = useNavigation();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmi, setBMI] = useState(null);
  const [category, setCategory] = useState('');
  const [useMetric, setUseMetric] = useState(true);
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');

  const toggleUnit = () => {
    setUseMetric(!useMetric);
    // Clear inputs when switching units
    setHeight('');
    setWeight('');
    setFeet('');
    setInches('');
    setBMI(null);
    setCategory('');
  };

  const calculateBMI = () => {
    let heightInMeters;
    let weightInKg;

    if (useMetric) {
      heightInMeters = parseFloat(height) / 100;
      weightInKg = parseFloat(weight);
    } else {
      // Convert feet and inches to meters
      const totalInches = (parseFloat(feet) * 12) + parseFloat(inches);
      heightInMeters = totalInches * 0.0254;
      // Convert pounds to kg
      weightInKg = parseFloat(weight) * 0.453592;
    }

    if ((useMetric && height && weight) || (!useMetric && feet && inches && weight)) {
      const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
      setBMI(bmiValue);
      
      if (bmiValue < 18.5) {
        setCategory('Underweight');
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        setCategory('Normal weight');
      } else if (bmiValue >= 25 && bmiValue < 30) {
        setCategory('Overweight');
      } else {
        setCategory('Obese');
      }
    }
  };

  const renderHeightInput = () => {
    if (useMetric) {
      return (
        <View style={styles.inputWithUnit}>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="0"
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.unit}>cm</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.imperialInputContainer}>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={[styles.input, styles.imperialInput]}
              value={feet}
              onChangeText={setFeet}
              placeholder="0"
              keyboardType="numeric"
              maxLength={1}
            />
            <Text style={styles.unit}>ft</Text>
          </View>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={[styles.input, styles.imperialInput]}
              value={inches}
              onChangeText={setInches}
              placeholder="0"
              keyboardType="numeric"
              maxLength={2}
            />
            <Text style={styles.unit}>in</Text>
          </View>
        </View>
      );
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

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Height</Text>
            {renderHeightInput()}
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Weight</Text>
            <View style={styles.inputWithUnit}>
              <TextInput
                style={styles.input}
                value={weight}
                onChangeText={setWeight}
                placeholder="0"
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={styles.unit}>{useMetric ? 'kg' : 'lbs'}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.calculateButton,
              (!weight || (useMetric && !height) || (!useMetric && (!feet || !inches))) && 
              styles.calculateButtonDisabled
            ]}
            onPress={calculateBMI}
            disabled={!weight || (useMetric && !height) || (!useMetric && (!feet || !inches))}
          >
            <Text style={styles.calculateButtonText}>Calculate BMI</Text>
          </TouchableOpacity>
        </View>

        {bmi && (
          <View style={styles.resultContainer}>
            <View style={styles.bmiValue}>
              <Text style={styles.bmiNumber}>{bmi}</Text>
              <Text style={styles.bmiLabel}>Your BMI</Text>
            </View>
            
            <Text style={styles.categoryText}>
              You are in the <Text style={styles.categoryHighlight}>{category}</Text> range
            </Text>

            <View style={styles.scaleContainer}>
              <View style={styles.scale}>
                <View style={[
                  styles.scaleIndicator,
                  { left: `${Math.min(Math.max((bmi / 40) * 100, 0), 100)}%` }
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
              {category === 'Normal weight' 
                ? 'You are at a healthy weight. Maintain a balanced diet and regular exercise routine.'
                : `Consider consulting with a healthcare provider about ways to achieve a healthier weight through diet and exercise.`
              }
            </Text>

            {category !== 'Normal weight' && (
              <ConsultationActions />
            )}
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
    padding: 24,
    borderRadius: 16,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  unit: {
    marginLeft: 12,
    fontSize: 16,
    color: '#666',
    width: 40,
  },
  calculateButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  calculateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  calculateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#f5f5f5',
    padding: 24,
    borderRadius: 16,
  },
  bmiValue: {
    alignItems: 'center',
    marginBottom: 24,
  },
  bmiNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  bmiLabel: {
    fontSize: 16,
    color: '#666',
  },
  categoryText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  categoryHighlight: {
    fontWeight: 'bold',
    color: '#6200ee',
  },
  scaleContainer: {
    marginBottom: 24,
  },
  scale: {
    height: 8,
    backgroundColor: '#ddd',
    borderRadius: 4,
    marginBottom: 8,
    position: 'relative',
  },
  scaleIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#6200ee',
    borderRadius: 8,
    top: -4,
    marginLeft: -8,
  },
  scaleMarkers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  scaleText: {
    fontSize: 12,
    color: '#666',
  },
  recommendationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  unitToggle: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 16,
  },
  unitToggleText: {
    color: '#6200ee',
    fontSize: 14,
    fontWeight: '500',
  },
  imperialInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imperialInput: {
    flex: 0.8,
    marginRight: 8,
  },
});

export default BMICalculator; 