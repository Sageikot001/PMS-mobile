import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';

const OvulationTracker = () => {
  const [trackingData, setTrackingData] = useState({
    bbt: '',
    symptoms: {
      cramps: false,
      breastTenderness: false,
      mood: false,
      discharge: false,
    },
    lhTest: 'negative', // 'negative', 'positive', 'not_tested'
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Tracking</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basal Body Temperature</Text>
        <TextInput
          style={styles.input}
          value={trackingData.bbt}
          onChangeText={(value) => setTrackingData({...trackingData, bbt: value})}
          keyboardType="decimal-pad"
          placeholder="36.5"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptoms</Text>
        {Object.keys(trackingData.symptoms).map((symptom) => (
          <View key={symptom} style={styles.symptomRow}>
            <Text style={styles.symptomText}>
              {symptom.charAt(0).toUpperCase() + symptom.slice(1).replace(/([A-Z])/g, ' $1')}
            </Text>
            <Switch
              value={trackingData.symptoms[symptom]}
              onValueChange={(value) => 
                setTrackingData({
                  ...trackingData,
                  symptoms: {...trackingData.symptoms, [symptom]: value}
                })
              }
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LH Test Result</Text>
        <View style={styles.lhButtons}>
          {['negative', 'positive', 'not_tested'].map((result) => (
            <TouchableOpacity
              key={result}
              style={[
                styles.lhButton,
                trackingData.lhTest === result && styles.selectedLhButton
              ]}
              onPress={() => setTrackingData({...trackingData, lhTest: result})}
            >
              <Text style={[
                styles.lhButtonText,
                trackingData.lhTest === result && styles.selectedLhButtonText
              ]}>
                {result.charAt(0).toUpperCase() + result.slice(1).replace('_', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  symptomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  symptomText: {
    fontSize: 16,
    color: '#333',
  },
  lhButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  lhButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedLhButton: {
    backgroundColor: '#6200ee',
  },
  lhButtonText: {
    color: '#333',
    fontSize: 14,
  },
  selectedLhButtonText: {
    color: '#fff',
  },
});

export default OvulationTracker; 