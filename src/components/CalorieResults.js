import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

const CalorieResults = ({ userData, onResultsCalculated }) => {
  const calculateBMR = () => {
    // Convert weight to kg if in lbs
    const weightInKg = userData.weightUnit === 'Lbs' 
      ? Number(userData.weight) / 2.20462 
      : Number(userData.weight);

    // Convert height to cm if in ft
    const heightInCm = userData.heightUnit === 'Ft'
      ? Number(userData.height) * 30.48
      : Number(userData.height);

    // Mifflin-St Jeor Equation
    const baseBMR = (10 * weightInKg) + (6.25 * heightInCm) - (5 * Number(userData.age));
    const bmr = userData.gender === 'male' ? baseBMR + 5 : baseBMR - 161;

    return bmr;
  };

  const calculateTDEE = (bmr) => {
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very_active': 1.9,
      'extra_active': 1.9
    };

    return Math.round(bmr * activityMultipliers[userData.activityLevel]);
  };

  const bmr = calculateBMR();
  const tdee = calculateTDEE(bmr);

  // Call the callback with results when component mounts or data changes
  useEffect(() => {
    if (onResultsCalculated && bmr && tdee) {
      const results = {
        bmr: Math.round(bmr),
        tdee: tdee,
        toLoseWeight: {
          min: tdee - 500,
          max: tdee - 250,
          rate: '0.5-1kg/week'
        },
        toMaintainWeight: {
          calories: tdee,
          rate: '0kg/week'
        },
        toGainWeight: {
          min: tdee + 250,
          max: tdee + 500,
          rate: '0.25-0.5kg/week'
        }
      };
      onResultsCalculated(results);
    }
  }, [bmr, tdee, onResultsCalculated]);

  return (
    <View style={styles.container}>
      <ResultCard
        title="To lose weight"
        calories={`${tdee - 500} - ${tdee - 250} Kcal/day`}
        rate="0.5-1kg/week"
        color="#FF9500"
      />
      
      <ResultCard
        title="To maintain weight"
        calories={`${tdee} Kcal/day`}
        rate="0kg/week"
        color="#007AFF"
      />
      
      <ResultCard
        title="To gain weight"
        calories={`${tdee + 250} - ${tdee + 500} Kcal/day`}
        rate="0.25-0.5kg/week"
        color="#34C759"
      />

      <Text style={styles.disclaimer}>
        *These calculations are estimates based on the Mifflin-St Jeor Equation
      </Text>
    </View>
  );
};

const ResultCard = ({ title, calories, rate, color }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={[styles.calories, { color }]}>{calories}</Text>
    <Text style={styles.rate}>{rate}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  calories: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rate: {
    fontSize: 14,
    color: '#666',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default CalorieResults; 