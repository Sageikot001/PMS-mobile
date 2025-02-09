import React from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

const CalorieResults = ({ userData }) => {
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
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
    <Text style={styles.calories}>{calories}</Text>
    <Text style={styles.rate}>{rate}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginVertical: 32,
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  calories: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  rate: {
    fontSize: 14,
    color: '#666',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default CalorieResults; 