import AsyncStorage from '@react-native-async-storage/async-storage';
import { paystackPublicKey } from '../config/env';

// Replace hardcoded key with environment variable
export const PAYSTACK_PUBLIC_KEY = paystackPublicKey;

export const generateReference = () => {
  return `PR-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
};

// Mock functions for frontend-only development
export const mockVerifyTransaction = (reference) => {
  // Always return success for testing
  return Promise.resolve({
    status: 'success',
    reference,
    amount: 0 // This will be overridden by the actual amount in the component
  });
};

export const mockUpdateWalletBalance = (userId, amount) => {
  // Just return success for now
  return Promise.resolve({
    success: true,
    newBalance: amount // In a real app, this would be current balance + amount
  });
};

export const initializeTransaction = async (amount, email, reference, metadata = {}) => {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to kobo (Paystack uses the smallest currency unit)
        reference,
        metadata,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initializing Paystack transaction:', error);
    throw error;
  }
};

export const verifyTransaction = async (reference) => {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}`,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying Paystack transaction:', error);
    throw error;
  }
}; 