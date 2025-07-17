import { Alert } from 'react-native';
import ApiService from '../services/ApiService';
import AuthService from '../services/AuthService';
import UserManagementService, { USER_TYPES } from '../services/UserManagementService';

/**
 * Quick Test Script for Integration Verification
 * Run this in development to quickly verify integration is working
 */

export const quickIntegrationTest = async () => {
  console.log('🚀 Starting Quick Integration Test...');
  
  const results = {
    apiService: false,
    authService: false,
    userManagement: false,
    errorHandling: false,
    dataTransformation: false,
    loginFix: false,
    profileMapping: false, // New test for profile mapping
  };

  try {
    // Test 1: API Service Basic Functionality
    console.log('1️⃣ Testing API Service...');
    try {
      // This should work with the dummy data in development
      const response = await ApiService.get('/health');
      results.apiService = true;
      console.log('✅ API Service: Working');
    } catch (error) {
      console.log('❌ API Service: Failed -', error.message);
    }

    // Test 2: Auth Service
    console.log('2️⃣ Testing Authentication Service...');
    try {
      const isAuth = await AuthService.isAuthenticated();
      results.authService = true;
      console.log('✅ Auth Service: Working - Authenticated:', isAuth);
    } catch (error) {
      console.log('❌ Auth Service: Failed -', error.message);
    }

    // Test 3: User Management Service
    console.log('3️⃣ Testing User Management Service...');
    try {
      const testData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phoneNumber: '+1234567890',
      };
      
      // Test validation
      UserManagementService.validateUserData(testData, USER_TYPES.PATIENT);
      
      // Test data formatting
      const formatted = UserManagementService.formatUserData(testData, USER_TYPES.PATIENT);
      
      if (formatted && formatted.userType === USER_TYPES.PATIENT) {
        results.userManagement = true;
        console.log('✅ User Management: Working');
      }
    } catch (error) {
      console.log('❌ User Management: Failed -', error.message);
    }

    // Test 4: Error Handling
    console.log('4️⃣ Testing Error Handling...');
    try {
      // This should trigger our error handling
      await ApiService.get('/nonexistent-endpoint');
    } catch (error) {
      if (error.name === 'ApiError' && error.errorCode) {
        results.errorHandling = true;
        console.log('✅ Error Handling: Working - Error Code:', error.errorCode);
      }
    }

    // Test 5: Data Transformation
    console.log('5️⃣ Testing Data Transformation...');
    try {
      // Test with dummy data
      const testData = { test: 'data' };
      const formatted = UserManagementService.formatUserData(testData, USER_TYPES.PATIENT);
      
      if (formatted.userType && formatted.createdAt && formatted.patientId) {
        results.dataTransformation = true;
        console.log('✅ Data Transformation: Working');
      }
    } catch (error) {
      console.log('❌ Data Transformation: Failed -', error.message);
    }

    // Test 6: Login Fix - Create user then login
    console.log('6️⃣ Testing Login Fix...');
    try {
      const testUserData = {
        email: `testuser${Date.now()}@example.com`,
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phoneNumber: '+1234567890',
      };
      
      // Create user
      await UserManagementService.createUser(testUserData, USER_TYPES.PATIENT);
      console.log('✅ User created successfully');
      
      // Try to login with the created user
      const loginResult = await AuthService.login(testUserData.email, testUserData.password);
      
      if (loginResult.success && loginResult.user) {
        results.loginFix = true;
        console.log('✅ Login Fix: Working - Can login with created user');
      }
    } catch (error) {
      console.log('❌ Login Fix: Failed -', error.message);
    }

    // Test 7: Profile Mapping - Check if firstName/lastName map to name and phoneNumber to phone
    console.log('7️⃣ Testing Profile Data Mapping...');
    try {
      const testUserData = {
        email: `profiletest${Date.now()}@example.com`,
        password: 'testpassword123',
        firstName: 'Profile',
        lastName: 'Test',
        dateOfBirth: '1990-01-01',
        gender: 'female',
        phoneNumber: '+1987654321',
      };
      
      // Create user
      await UserManagementService.createUser(testUserData, USER_TYPES.PATIENT);
      console.log('✅ Profile test user created');
      
      // Login and check profile mapping
      const loginResult = await AuthService.login(testUserData.email, testUserData.password);
      
      if (loginResult.success && loginResult.user) {
        const user = loginResult.user;
        
        const hasCorrectName = user.name === `${testUserData.firstName} ${testUserData.lastName}`;
        const hasCorrectPhone = user.phone === testUserData.phoneNumber;
        const hasCorrectEmail = user.email === testUserData.email;
        
        if (hasCorrectName && hasCorrectPhone && hasCorrectEmail) {
          results.profileMapping = true;
          console.log('✅ Profile Mapping: Working - All fields correctly mapped');
          console.log(`   Name: ${user.name} (expected: ${testUserData.firstName} ${testUserData.lastName})`);
          console.log(`   Phone: ${user.phone} (expected: ${testUserData.phoneNumber})`);
          console.log(`   Email: ${user.email} (expected: ${testUserData.email})`);
        } else {
          console.log('❌ Profile Mapping: Failed - Field mapping incorrect');
          console.log(`   Name: ${user.name} (expected: ${testUserData.firstName} ${testUserData.lastName}) - ${hasCorrectName ? '✅' : '❌'}`);
          console.log(`   Phone: ${user.phone} (expected: ${testUserData.phoneNumber}) - ${hasCorrectPhone ? '✅' : '❌'}`);
          console.log(`   Email: ${user.email} (expected: ${testUserData.email}) - ${hasCorrectEmail ? '✅' : '❌'}`);
        }
        
        // Logout after test
        await AuthService.logout();
      }
    } catch (error) {
      console.log('❌ Profile Mapping: Failed -', error.message);
    }

    // Generate Report
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const passRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log('\n📊 Quick Test Results:');
    console.log(`✅ Passed: ${passedTests}/${totalTests} (${passRate}%)`);
    console.log('📋 Details:', results);

    // Show alert with results
    Alert.alert(
      'Integration Test Results',
      `${passedTests}/${totalTests} tests passed (${passRate}%)\n\n` +
      `API Service: ${results.apiService ? '✅' : '❌'}\n` +
      `Auth Service: ${results.authService ? '✅' : '❌'}\n` +
      `User Management: ${results.userManagement ? '✅' : '❌'}\n` +
      `Error Handling: ${results.errorHandling ? '✅' : '❌'}\n` +
      `Data Transformation: ${results.dataTransformation ? '✅' : '❌'}\n` +
      `Login Fix: ${results.loginFix ? '✅' : '❌'}\n` +
      `Profile Mapping: ${results.profileMapping ? '✅' : '❌'}`,
      [
        { text: 'OK', style: 'default' },
      ]
    );

    return {
      passed: passedTests,
      total: totalTests,
      passRate: parseFloat(passRate),
      results,
    };

  } catch (error) {
    console.error('❌ Quick test failed:', error);
    Alert.alert('Test Error', `Quick test failed: ${error.message}`);
    return {
      passed: 0,
      total: Object.keys(results).length,
      passRate: 0,
      results,
      error: error.message,
    };
  }
};

// Test profile mapping specifically
export const testProfileMapping = async () => {
  try {
    console.log('🔍 Testing Profile Mapping...');
    
    const testUserData = {
      email: `profiletest${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Profile',
      lastName: 'Test',
      dateOfBirth: '1990-01-01',
      gender: 'female',
      phoneNumber: '+1987654321',
    };
    
    // Create user
    console.log('Creating user...');
    await UserManagementService.createUser(testUserData, USER_TYPES.PATIENT);
    console.log('✅ User created successfully');
    
    // Login and check profile mapping
    console.log('Attempting login...');
    const loginResult = await AuthService.login(testUserData.email, testUserData.password);
    
    if (loginResult.success && loginResult.user) {
      const user = loginResult.user;
      
      const hasCorrectName = user.name === `${testUserData.firstName} ${testUserData.lastName}`;
      const hasCorrectPhone = user.phone === testUserData.phoneNumber;
      const hasCorrectEmail = user.email === testUserData.email;
      
      if (hasCorrectName && hasCorrectPhone && hasCorrectEmail) {
        console.log('✅ Profile mapping successful');
        Alert.alert(
          'Profile Mapping Test Passed!',
          `All fields correctly mapped:\n\n` +
          `Name: ${user.name}\n` +
          `Phone: ${user.phone}\n` +
          `Email: ${user.email}\n\n` +
          `Expected:\n` +
          `Name: ${testUserData.firstName} ${testUserData.lastName}\n` +
          `Phone: ${testUserData.phoneNumber}\n` +
          `Email: ${testUserData.email}`
        );
        
        // Logout after test
        await AuthService.logout();
        return true;
      } else {
        console.log('❌ Profile mapping failed');
        Alert.alert(
          'Profile Mapping Test Failed',
          `Field mapping incorrect:\n\n` +
          `Name: ${user.name} ${hasCorrectName ? '✅' : '❌'}\n` +
          `Phone: ${user.phone} ${hasCorrectPhone ? '✅' : '❌'}\n` +
          `Email: ${user.email} ${hasCorrectEmail ? '✅' : '❌'}\n\n` +
          `Expected:\n` +
          `Name: ${testUserData.firstName} ${testUserData.lastName}\n` +
          `Phone: ${testUserData.phoneNumber}\n` +
          `Email: ${testUserData.email}`
        );
        return false;
      }
    } else {
      console.log('❌ Login failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Profile mapping test failed:', error.message);
    Alert.alert('Profile Mapping Test Failed', error.message);
    return false;
  }
};

// Test the login fix specifically
export const testLoginFix = async () => {
  try {
    console.log('🔍 Testing Login Fix...');
    
    const testUserData = {
      email: `testuser${Date.now()}@example.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      phoneNumber: '+1234567890',
    };
    
    // Create user
    console.log('Creating user...');
    await UserManagementService.createUser(testUserData, USER_TYPES.PATIENT);
    console.log('✅ User created successfully');
    
    // Try to login with the created user
    console.log('Attempting login...');
    const loginResult = await AuthService.login(testUserData.email, testUserData.password);
    
    if (loginResult.success && loginResult.user) {
      console.log('✅ Login successful with created user');
      Alert.alert(
        'Login Fix Test Passed!',
        `Successfully created and logged in with:\nEmail: ${testUserData.email}\nPassword: ${testUserData.password}`
      );
      return true;
    } else {
      console.log('❌ Login failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Login Fix test failed:', error.message);
    Alert.alert('Login Fix Test Failed', error.message);
    return false;
  }
};

// Test individual components
export const testApiService = async () => {
  try {
    const response = await ApiService.get('/health');
    console.log('✅ API Service test passed:', response);
    return true;
  } catch (error) {
    console.log('❌ API Service test failed:', error.message);
    return false;
  }
};

export const testAuthService = async () => {
  try {
    const isAuth = await AuthService.isAuthenticated();
    const user = await AuthService.getCurrentUser();
    console.log('✅ Auth Service test passed - Auth:', isAuth, 'User:', user);
    return true;
  } catch (error) {
    console.log('❌ Auth Service test failed:', error.message);
    return false;
  }
};

export const testUserManagement = async () => {
  try {
    const testData = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    
    const formatted = UserManagementService.formatUserData(testData, USER_TYPES.PATIENT);
    console.log('✅ User Management test passed:', formatted);
    return true;
  } catch (error) {
    console.log('❌ User Management test failed:', error.message);
    return false;
  }
};

export const testErrorHandling = async () => {
  try {
    await ApiService.get('/nonexistent-endpoint');
    console.log('❌ Error Handling test failed - No error thrown');
    return false;
  } catch (error) {
    if (error.name === 'ApiError') {
      console.log('✅ Error Handling test passed:', error.errorCode);
      return true;
    }
    console.log('❌ Error Handling test failed - Wrong error type:', error.name);
    return false;
  }
};

// Quick component test
export const testComponents = () => {
  try {
    // Test imports
    const ErrorBoundary = require('../components/ErrorBoundary').default;
    const LoadingState = require('../components/LoadingState').default;
    const hooks = require('../hooks/useApi');
    
    const hasErrorBoundary = !!ErrorBoundary;
    const hasLoadingState = !!LoadingState;
    const hasHooks = !!(hooks.useApi && hooks.useFormApi && hooks.usePaginatedApi);
    
    console.log('✅ Components test passed - ErrorBoundary:', hasErrorBoundary, 'LoadingState:', hasLoadingState, 'Hooks:', hasHooks);
    
    return hasErrorBoundary && hasLoadingState && hasHooks;
  } catch (error) {
    console.log('❌ Components test failed:', error.message);
    return false;
  }
};

// Export utility for easy console testing
export const runQuickTest = () => {
  console.log('🧪 Running Quick Integration Test...');
  return quickIntegrationTest();
};

export default {
  quickIntegrationTest,
  testApiService,
  testAuthService,
  testUserManagement,
  testErrorHandling,
  testComponents,
  runQuickTest,
  testLoginFix,
  testProfileMapping,
}; 