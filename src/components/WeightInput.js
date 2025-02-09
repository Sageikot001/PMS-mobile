import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

const WeightInput = ({ value, onChange, onContinue }) => {
  const [unit, setUnit] = useState('Kg'); // or 'Lbs'

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        placeholder="00"
        placeholderTextColor="#999"
      />
      <View style={styles.unitSelector}>
        <TouchableOpacity 
          style={[styles.unitButton, unit === 'Lbs' && styles.activeUnit]}
          onPress={() => setUnit('Lbs')}
        >
          <Text style={[styles.unitText, unit === 'Lbs' && styles.activeUnitText]}>Lbs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.unitButton, unit === 'Kg' && styles.activeUnit]}
          onPress={() => setUnit('Kg')}
        >
          <Text style={[styles.unitText, unit === 'Kg' && styles.activeUnitText]}>Kg</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity 
        style={[styles.continueButton, !value && styles.disabledButton]}
        onPress={onContinue}
        disabled={!value}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 32,
  },
  input: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    marginBottom: 16,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
    marginBottom: 32,
  },
  unitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  activeUnit: {
    backgroundColor: '#fff',
  },
  unitText: {
    color: '#666',
    fontSize: 16,
  },
  activeUnitText: {
    color: '#000',
  },
  continueButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WeightInput; 