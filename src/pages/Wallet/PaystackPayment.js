import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PAYSTACK_PUBLIC_KEY, mockVerifyTransaction } from '../../services/PaystackService';

/**
 * PaystackPayment Component
 * 
 * This component handles the payment process using Paystack.
 * It creates a WebView that loads the Paystack JavaScript SDK
 * and automatically initiates the payment flow.
 */
const PaystackPayment = () => {
  // Get navigation and route objects from React Navigation
  const navigation = useNavigation();
  const route = useRoute();
  
  // Extract the parameters passed from the previous screen
  const { amount, email, reference } = route.params;

  const handlePaymentComplete = async (paymentData) => {
    try {
      // For development, simulate successful payment verification
      await mockVerifyTransaction(paymentData.reference);
      
      // Store transaction info in AsyncStorage for the wallet to display
      try {
        const existingTransactionsJSON = await AsyncStorage.getItem('transactions');
        const existingTransactions = existingTransactionsJSON ? JSON.parse(existingTransactionsJSON) : [];
        
        // Add this transaction to the list
        const newTransaction = {
          id: paymentData.reference,
          amount: amount,
          type: 'credit',
          description: 'Wallet top-up',
          date: new Date().toISOString()
        };
        
        const updatedTransactions = [newTransaction, ...existingTransactions];
        await AsyncStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      } catch (storageError) {
        console.error('Error storing transaction:', storageError);
      }
      
      // Show success message
      Alert.alert(
        'Payment Successful',
        `Your wallet has been topped up with ₦${amount.toFixed(2)}`,
        [
          { 
            text: 'OK',
            onPress: () => {
              // Store the transaction data in AsyncStorage
              try {
                // This AsyncStorage data can be loaded by Wallet when it appears
                AsyncStorage.setItem('lastTransaction', JSON.stringify({
                  amount,
                  reference,
                  date: new Date().toISOString(),
                  status: 'success'
                }));
              } catch (error) {
                console.error('Error storing transaction:', error);
              }
              
              // Go back twice - first from PaystackPayment to TopUp
              navigation.goBack();
              // Then from TopUp to Wallet
              setTimeout(() => navigation.goBack(), 100);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Payment Error',
        'There was an error processing your payment. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  /**
   * HTML content for the WebView that includes the Paystack checkout.
   * This HTML loads the Paystack JavaScript SDK and automatically
   * initiates the payment when the page loads.
   */
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Paystack Payment</title>
      <!-- Load Paystack JavaScript SDK -->
      <script src="https://js.paystack.co/v1/inline.js"></script>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; }
        .loading { font-size: 18px; color: #333; margin-bottom: 20px; }
      </style>
    </head>
    <body onload="payWithPaystack()">
      <div class="container">
        <div class="loading">Initializing payment...</div>
      </div>
      
      <script>
        /**
         * Initialize Paystack payment when the page loads
         * This function configures and opens the Paystack payment modal
         */
        function payWithPaystack() {
          var handler = PaystackPop.setup({
            // Your public key from Paystack Dashboard
            key: '${PAYSTACK_PUBLIC_KEY}',
            
            // Customer email
            email: '${email}',
            
            // Amount in kobo (smallest currency unit)
            amount: ${amount * 100},
            
            // Unique transaction reference
            ref: '${reference}',
            
            // Called when payment modal is closed without completing payment
            onClose: function() {
              // Send message to React Native when payment modal is closed
              window.ReactNativeWebView.postMessage(JSON.stringify({status: 'closed'}));
            },
            
            // Called after successful payment
            callback: function(response) {
              // Send message to React Native when payment is completed
              window.ReactNativeWebView.postMessage(JSON.stringify({
                status: 'success',
                reference: response.reference,
                transaction: response.transaction
              }));
            }
          });
          
          // Open the Paystack inline payment modal
          handler.openIframe();
        }
      </script>
    </body>
    </html>
  `;

  /**
   * Handle messages sent from the WebView to React Native
   * 
   * This function processes payment results from Paystack
   * and updates the app accordingly.
   * 
   * @param {Object} event - The message event from WebView
   */
  const handleMessage = (event) => {
    try {
      // Parse the JSON data from the message
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.status === 'success') {
        handlePaymentComplete(data);
      } else if (data.status === 'closed') {
        // Handle payment cancellation
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* WebView component to load the Paystack checkout */}
      <WebView
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        style={styles.webview}
      />
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  webview: {
    flex: 1,
  }
});

export default PaystackPayment;