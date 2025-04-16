import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const PaymentOptions = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { total } = route.params;
  const [selectedMethod, setSelectedMethod] = useState('wallet');

  const handlePayment = () => {
    switch (selectedMethod) {
      case 'wallet':
        // Check if wallet balance is sufficient
        const walletBalance = 5000; // Replace with actual wallet balance from your state/context
        
        if (walletBalance >= total) {
          // Process wallet payment
          // For example:
          // await processWalletPayment(userId, total);
          
          Alert.alert(
            'Payment Successful',
            'Your order has been placed successfully!',
            [{ text: 'OK', onPress: () => navigation.navigate('OrderConfirmation') }]
          );
        } else {
          Alert.alert(
            'Insufficient Balance',
            'Your wallet balance is not enough. Would you like to top up?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Top Up', onPress: () => navigation.navigate('TopUp') },
            ]
          );
        }
        break;
        
      case 'card':
        // Navigate to Paystack payment
        navigation.navigate('CheckoutPaystack', { amount: total });
        break;
        
      case 'bank':
        // Navigate to bank transfer payment
        navigation.navigate('BankTransfer', { amount: total });
        break;
        
      default:
        Alert.alert('Select Payment Method', 'Please select a payment method');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmount}>₦{total.toFixed(2)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Select Payment Method</Text>
        
        <TouchableOpacity 
          style={[
            styles.paymentOption,
            selectedMethod === 'wallet' && styles.selectedOption
          ]}
          onPress={() => setSelectedMethod('wallet')}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="wallet-outline" size={24} color="#7E3AF2" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Wallet</Text>
              <Text style={styles.optionDescription}>Pay from your wallet balance</Text>
            </View>
          </View>
          <View style={styles.radio}>
            {selectedMethod === 'wallet' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.paymentOption,
            selectedMethod === 'card' && styles.selectedOption
          ]}
          onPress={() => setSelectedMethod('card')}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="card-outline" size={24} color="#7E3AF2" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Card Payment</Text>
              <Text style={styles.optionDescription}>Pay with credit/debit card</Text>
            </View>
          </View>
          <View style={styles.radio}>
            {selectedMethod === 'card' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.paymentOption,
            selectedMethod === 'bank' && styles.selectedOption
          ]}
          onPress={() => setSelectedMethod('bank')}
        >
          <View style={styles.optionLeft}>
            <Ionicons name="business-outline" size={24} color="#7E3AF2" />
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Bank Transfer</Text>
              <Text style={styles.optionDescription}>Pay via bank transfer</Text>
            </View>
          </View>
          <View style={styles.radio}>
            {selectedMethod === 'bank' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.payButton}
          onPress={handlePayment}
        >
          <Text style={styles.payButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  totalContainer: {
    backgroundColor: '#f8f0ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7E3AF2',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 12,
  },
  selectedOption: {
    borderColor: '#7E3AF2',
    backgroundColor: '#f8f0ff',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionInfo: {
    marginLeft: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#7E3AF2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7E3AF2',
  },
  payButton: {
    backgroundColor: '#7E3AF2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PaymentOptions; 