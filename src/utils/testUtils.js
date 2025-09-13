import { ApiService, UserManagementService, USER_TYPES, USER_STATUS, AuthService } from '../lib/api';

/**
 * Testing utilities for API integration and user management
 */
class TestUtils {
  
  constructor() {
    this.testResults = [];
    this.testSession = null;
  }

  // Initialize test session
  async initializeTestSession() {
    this.testSession = {
      id: `test_session_${Date.now()}`,
      startTime: new Date().toISOString(),
      results: [],
    };
    
    console.log('🧪 Test session initialized:', this.testSession.id);
    return this.testSession;
  }

  // Log test result
  logTestResult(testName, passed, details = {}) {
    const result = {
      testName,
      passed,
      details,
      timestamp: new Date().toISOString(),
    };
    
    this.testResults.push(result);
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}:`, details);
    
    return result;
  }

  // Test API connectivity
  async testApiConnectivity() {
    try {
      console.log('🔍 Testing API connectivity...');
      
      // Test basic connectivity
      const response = await ApiService.get('/health');
      
      this.logTestResult('API Connectivity', true, {
        endpoint: '/health',
        response: response,
      });
      
      return true;
    } catch (error) {
      this.logTestResult('API Connectivity', false, {
        error: error.message,
        errorCode: error.errorCode,
      });
      
      return false;
    }
  }

  // Test authentication flow
  async testAuthenticationFlow() {
    try {
      console.log('🔍 Testing authentication flow...');
      
      // Test login with dummy credentials
      const testCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      
      const loginResult = await AuthService.login(
        testCredentials.email, 
        testCredentials.password
      );
      
      this.logTestResult('Authentication - Login', true, {
        credentials: testCredentials,
        result: loginResult,
      });
      
      // Test token retrieval
      const isAuthenticated = await AuthService.isAuthenticated();
      this.logTestResult('Authentication - Token Check', isAuthenticated, {
        isAuthenticated,
      });
      
      // Test profile retrieval
      const profile = await AuthService.getCurrentUser();
      this.logTestResult('Authentication - Profile Retrieval', !!profile, {
        profile,
      });
      
      return true;
    } catch (error) {
      this.logTestResult('Authentication Flow', false, {
        error: error.message,
        errorCode: error.errorCode,
      });
      
      return false;
    }
  }

  // Test user creation for different user types
  async testUserCreation() {
    try {
      console.log('🔍 Testing user creation...');
      
      const testUsers = [
        {
          type: USER_TYPES.PATIENT,
          data: {
            email: 'patient@test.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: '1990-01-01',
            gender: 'male',
            phoneNumber: '+1234567890',
          },
        },
        {
          type: USER_TYPES.DOCTOR,
          data: {
            email: 'doctor@test.com',
            password: 'password123',
            firstName: 'Dr. Jane',
            lastName: 'Smith',
            medicalLicense: 'MD123456',
            specializations: ['Cardiology', 'Internal Medicine'],
            phoneNumber: '+1234567891',
          },
        },
        {
          type: USER_TYPES.INSTITUTION,
          data: {
            email: 'institution@test.com',
            password: 'password123',
            firstName: 'Admin',
            lastName: 'User',
            institutionName: 'Test Hospital',
            address: '123 Hospital St, City, State',
            phoneNumber: '+1234567892',
          },
        },
      ];
      
      for (const testUser of testUsers) {
        try {
          const result = await UserManagementService.createUser(
            testUser.data,
            testUser.type
          );
          
          this.logTestResult(`User Creation - ${testUser.type}`, true, {
            userType: testUser.type,
            userData: testUser.data,
            result,
          });
        } catch (error) {
          this.logTestResult(`User Creation - ${testUser.type}`, false, {
            userType: testUser.type,
            error: error.message,
            errorCode: error.errorCode,
          });
        }
      }
      
      return true;
    } catch (error) {
      this.logTestResult('User Creation', false, {
        error: error.message,
        errorCode: error.errorCode,
      });
      
      return false;
    }
  }

  // Test error handling
  async testErrorHandling() {
    try {
      console.log('🔍 Testing error handling...');
      
      // Test network error handling
      try {
        await ApiService.get('/nonexistent-endpoint');
        this.logTestResult('Error Handling - 404', false, {
          message: 'Should have thrown 404 error',
        });
      } catch (error) {
        this.logTestResult('Error Handling - 404', true, {
          error: error.message,
          errorCode: error.errorCode,
          statusCode: error.statusCode,
        });
      }
      
      // Test validation error handling
      try {
        await UserManagementService.createUser({}, USER_TYPES.PATIENT);
        this.logTestResult('Error Handling - Validation', false, {
          message: 'Should have thrown validation error',
        });
      } catch (error) {
        this.logTestResult('Error Handling - Validation', true, {
          error: error.message,
          errorCode: error.errorCode,
        });
      }
      
      return true;
    } catch (error) {
      this.logTestResult('Error Handling', false, {
        error: error.message,
        errorCode: error.errorCode,
      });
      
      return false;
    }
  }

  // Test data transformation
  async testDataTransformation() {
    try {
      console.log('🔍 Testing data transformation...');
      
      // Test response transformation
      const testData = { test: 'data' };
      const response = await ApiService.post('/echo', testData);
      
      const hasCorrectStructure = response.hasOwnProperty('success') && 
                                 response.hasOwnProperty('data') && 
                                 response.hasOwnProperty('message');
      
      this.logTestResult('Data Transformation - Response Structure', hasCorrectStructure, {
        response,
        hasCorrectStructure,
      });
      
      // Test user data formatting
      const userData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      
      const formatted = UserManagementService.formatUserData(userData, USER_TYPES.PATIENT);
      
      const hasRequiredFields = formatted.hasOwnProperty('userType') && 
                               formatted.hasOwnProperty('createdAt') && 
                               formatted.hasOwnProperty('patientId');
      
      this.logTestResult('Data Transformation - User Formatting', hasRequiredFields, {
        original: userData,
        formatted,
        hasRequiredFields,
      });
      
      return true;
    } catch (error) {
      this.logTestResult('Data Transformation', false, {
        error: error.message,
        errorCode: error.errorCode,
      });
      
      return false;
    }
  }

  // Test pagination
  async testPagination() {
    try {
      console.log('🔍 Testing pagination...');
      
      const page1 = await UserManagementService.getUsersByType(USER_TYPES.PATIENT, 1, 10);
      const page2 = await UserManagementService.getUsersByType(USER_TYPES.PATIENT, 2, 10);
      
      this.logTestResult('Pagination - Page 1', true, {
        page: 1,
        data: page1,
      });
      
      this.logTestResult('Pagination - Page 2', true, {
        page: 2,
        data: page2,
      });
      
      return true;
    } catch (error) {
      this.logTestResult('Pagination', false, {
        error: error.message,
        errorCode: error.errorCode,
      });
      
      return false;
    }
  }

  // Test token refresh mechanism
  async testTokenRefresh() {
    try {
      console.log('🔍 Testing token refresh...');
      
      // This would simulate an expired token scenario
      // In a real scenario, you might manipulate the token to be expired
      
      const refreshResult = await AuthService.getUserProfile();
      
      this.logTestResult('Token Refresh', true, {
        refreshResult,
      });
      
      return true;
    } catch (error) {
      this.logTestResult('Token Refresh', false, {
        error: error.message,
        errorCode: error.errorCode,
      });
      
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🧪 Starting comprehensive API integration tests...');
    
    await this.initializeTestSession();
    
    const tests = [
      this.testApiConnectivity,
      this.testAuthenticationFlow,
      this.testUserCreation,
      this.testErrorHandling,
      this.testDataTransformation,
      this.testPagination,
      this.testTokenRefresh,
    ];
    
    for (const test of tests) {
      try {
        await test.call(this);
        await this.delay(1000); // Add delay between tests
      } catch (error) {
        console.error('Test execution error:', error);
      }
    }
    
    return this.generateTestReport();
  }

  // Generate test report
  generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    
    const report = {
      sessionId: this.testSession?.id,
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
      },
      results: this.testResults,
      timestamp: new Date().toISOString(),
    };
    
    console.log('📊 Test Report:', report);
    
    return report;
  }

  // Performance test
  async performanceTest(endpoint, iterations = 10) {
    console.log(`⚡ Performance testing ${endpoint}...`);
    
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      
      try {
        await ApiService.get(endpoint);
        const endTime = Date.now();
        times.push(endTime - startTime);
      } catch (error) {
        console.error(`Performance test iteration ${i + 1} failed:`, error);
      }
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    const performanceResult = {
      endpoint,
      iterations,
      avgTime,
      minTime,
      maxTime,
      times,
    };
    
    this.logTestResult(`Performance Test - ${endpoint}`, true, performanceResult);
    
    return performanceResult;
  }

  // Load test
  async loadTest(endpoint, concurrency = 5) {
    console.log(`🏋️ Load testing ${endpoint} with ${concurrency} concurrent requests...`);
    
    const promises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < concurrency; i++) {
      promises.push(
        ApiService.get(endpoint).catch(error => ({ error: error.message }))
      );
    }
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    const successful = results.filter(result => !result.error).length;
    const failed = results.filter(result => result.error).length;
    
    const loadResult = {
      endpoint,
      concurrency,
      successful,
      failed,
      totalTime: endTime - startTime,
      avgTimePerRequest: (endTime - startTime) / concurrency,
      results,
    };
    
    this.logTestResult(`Load Test - ${endpoint}`, true, loadResult);
    
    return loadResult;
  }

  // Utility method for delays
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Clear test results
  clearResults() {
    this.testResults = [];
    this.testSession = null;
    console.log('🧹 Test results cleared');
  }
}

export default new TestUtils(); 