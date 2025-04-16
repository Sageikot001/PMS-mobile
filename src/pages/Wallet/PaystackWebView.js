import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as PaystackService from '../../services/PaystackService';

const PaystackWebView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { authorizationUrl, reference, amount } = route.params;
  const [isLoading, setIsLoading] = useState(true);

  const handleNavigationStateChange = async (state) => {
    // Check if the URL contains your success or callback URL
    if (state.url.includes('your-success-url')) {
      try {
        // Verify the transaction
        const verificationResponse = await PaystackService.verifyTransaction(reference);
        
        if (verificationResponse.status && verificationResponse.data.status === 'success') {
          // Update the user's wallet balance in your backend/database
          // For example:
          // await updateWalletBalance(userId, amount);
          
          Alert.alert(
            'Success',
            `Your wallet has been topped up with ₦${amount.toFixed(2)}`,
            [{ text: 'OK', onPress: () => navigation.navigate('Wallet') }]
          );
        } else {
          Alert.alert(
            'Transaction Failed',
            'The payment could not be processed. Please try again.',
            [{ text: 'OK', onPress: () => navigation.navigate('Wallet') }]
          );
        }
      } catch (error) {
        console.error('Error verifying transaction:', error);
        Alert.alert(
          'Verification Error',
          'An error occurred while verifying your payment. Please contact support.',
          [{ text: 'OK', onPress: () => navigation.navigate('Wallet') }]
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#7E3AF2" />
        </View>
      )}
      
      <WebView
        source={{ uri: authorizationUrl }}
        style={styles.webview}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1,
  },
});

export default PaystackWebView; 