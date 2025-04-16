import { PAYSTACK_PUBLIC_KEY, FLUTTERWAVE_PUBLIC_KEY } from '@env';

export const paystackPublicKey = PAYSTACK_PUBLIC_KEY || 'pk_test_3dc9e07411801bf934aba4e41abdabb5d6d10599';
export const flutterwavePublicKey = FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST_dummy_key';

// Function to check if we're in development or production environment
export const isDevelopment = () => {
  return __DEV__;
}; 