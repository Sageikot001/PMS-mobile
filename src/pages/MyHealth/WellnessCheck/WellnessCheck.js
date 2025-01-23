import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WellnessCheck = () => {
  const navigation = useNavigation();

  const calculators = [
    {
      id: 'bmi',
      title: 'BMI checker',
      description: 'Are you a pear or apple? Find out with our BMI checker and get a grip on your health journey!',
    //   icon: require('../../../../assets/icons/bmi-icon.png'),
      route: 'BMICalculator'
    },
    {
      id: 'calorie',
      title: 'Calorie checker',
      description: "Counting calories doesn't have to be a drag! Let our calorie checker do the math for you and enjoy guilt-free snacking",
    //   icon: require('../../../../assets/icons/calorie-icon.png'),
      route: 'CalorieCalculator'
    },
    {
      id: 'ovulation',
      title: 'Ovulation checker',
      description: 'Plan the perfect dance party! Get in sync with your body and start your baby-making journey today or not',
    //   icon: require('../../../../assets/icons/ovulation-icon.png'),
      route: 'OvulationCalculator'
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Wellness check</Text>
      <Text style={styles.subtitle}>
        Keep your body in good shape, calculate your way to a healthier you.
      </Text>

      {calculators.map((calculator) => (
        <TouchableOpacity
          key={calculator.id}
          style={styles.calculatorCard}
          onPress={() => navigation.navigate(calculator.route)}
        >
          <View style={styles.cardContent}>
            <Image 
              source={calculator.icon}
              style={styles.calculatorIcon}
              resizeMode="contain"
            />
            <View style={styles.calculatorInfo}>
              <Text style={styles.calculatorTitle}>{calculator.title}</Text>
              <Text style={styles.calculatorDescription}>
                {calculator.description}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.calculateButton}
            onPress={() => navigation.navigate(calculator.route)}
          >
            <Text style={styles.calculateButtonText}>
              Calculate {calculator.id.toUpperCase()}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
  calculatorCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calculatorIcon: {
    width: 60,
    height: 60,
    marginRight: 16,
  },
  calculatorInfo: {
    flex: 1,
  },
  calculatorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calculatorDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  calculateButton: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WellnessCheck; 