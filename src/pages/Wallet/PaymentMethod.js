import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PaymentOption = ({ icon, title, description, selected, onSelect }) => (
  <TouchableOpacity 
    style={[styles.paymentCard, selected && styles.paymentCardSelected]}
    onPress={onSelect}
  >
    <View style={styles.paymentIcon}>
      {icon}
    </View>
    <View style={styles.paymentInfo}>
      <Text style={styles.paymentTitle}>{title}</Text>
      <Text style={styles.paymentDescription}>{description}</Text>
    </View>
    <View style={[styles.radioButton, selected && styles.radioButtonSelected]}>
      {selected && <View style={styles.radioButtonInner} />}
    </View>
  </TouchableOpacity>
);

const PaymentMethod = () => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment method</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.subtitle}>Select your preferred payment method</Text>

        <View style={styles.options}>
          <PaymentOption
            icon={<Ionicons name="card-outline" size={24} color="#7E3AF2" />}
            title="Debit/Credit Card"
            description="Pay with Mastercard or Visa"
            selected={selectedMethod === 'card'}
            onSelect={() => setSelectedMethod('card')}
          />

          <PaymentOption
            icon={<Ionicons name="cash-outline" size={24} color="#7E3AF2" />}
            title="Bank Transfer"
            description="Pay directly from your bank account"
            selected={selectedMethod === 'bank'}
            onSelect={() => setSelectedMethod('bank')}
          />

          <PaymentOption
            icon={<Ionicons name="wallet-outline" size={24} color="#7E3AF2" />}
            title="USSD"
            description="Pay using your bank's USSD code"
            selected={selectedMethod === 'ussd'}
            onSelect={() => setSelectedMethod('ussd')}
          />
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={[styles.continueButton, !selectedMethod && styles.continueButtonDisabled]}
        disabled={!selectedMethod}
        onPress={() => navigation.navigate('PaymentDetails', { method: selectedMethod })}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    padding: 16,
  },
  options: {
    padding: 16,
    gap: 16,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardSelected: {
    borderColor: '#7E3AF2',
    backgroundColor: '#f0e6ff',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#666',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#7E3AF2',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7E3AF2',
  },
  continueButton: {
    backgroundColor: '#7E3AF2',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#ccc',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PaymentMethod; 