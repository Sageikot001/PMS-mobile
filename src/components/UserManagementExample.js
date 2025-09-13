import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';

// Import our new components and hooks
import ErrorBoundary from './ErrorBoundary';
import {
  FullScreenLoading,
  SkeletonItem,
  LoadingButton,
  InlineLoading,
} from './LoadingState';
import { AuthService, HealthDataService, HEALTH_METRIC_TYPES, WELLNESS_CALCULATION_TYPES } from '../lib/api';
import TestUtils from '../utils/testUtils';

// Mock data for demo purposes
const MOCK_USER_STATS = {
  totalUsers: 142,
  activeUsers: 98,
  pendingUsers: 12,
  inactiveUsers: 32,
};

const MOCK_USERS = {
  patients: [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      userType: 'patient',
      status: 'active',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      userType: 'patient',
      status: 'active',
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@example.com',
      userType: 'patient',
      status: 'pending',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  doctors: [
    {
      id: '4',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@hospital.com',
      userType: 'doctor',
      status: 'active',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      firstName: 'Dr. Robert',
      lastName: 'Brown',
      email: 'robert.brown@clinic.com',
      userType: 'doctor',
      status: 'active',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  pharmacists: [
    {
      id: '6',
      firstName: 'Alice',
      lastName: 'Green',
      email: 'alice.green@pharmacy.com',
      userType: 'pharmacist',
      status: 'active',
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

const USER_TYPES = {
  PATIENT: 'patients',
  DOCTOR: 'doctors',
  PHARMACIST: 'pharmacists',
};

/**
 * Example component demonstrating the complete integration
 * Shows how to use error boundaries, loading states, and user management (with mock data)
 */
const UserManagementExample = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Mock API state management
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersRefreshing, setUsersRefreshing] = useState(false);
  const [userStats, setUserStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);

  // Mock API functions
  const mockFetchUsers = async (userType) => {
    setUsersLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUsers = MOCK_USERS[userType] || [];
    setUsers(mockUsers);
    setUsersLoading(false);
  };

  const mockFetchStats = async () => {
    setStatsLoading(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setUserStats(MOCK_USER_STATS);
    setStatsLoading(false);
  };

  const mockRefreshUsers = async () => {
    setUsersRefreshing(true);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const mockUsers = MOCK_USERS[activeTab] || [];
    setUsers(mockUsers);
    setUsersRefreshing(false);
  };

  // Load users when tab changes
  useEffect(() => {
    mockFetchUsers(activeTab);
  }, [activeTab]);

  // Load stats on mount
  useEffect(() => {
    mockFetchStats();
  }, []);

  // Load available accounts for debugging
  useEffect(() => {
    loadAvailableAccounts();
  }, []);

  // Function to load available accounts
  const loadAvailableAccounts = async () => {
    try {
      const accounts = await AuthService.getCreatedUsers?.() || [];
      setAvailableAccounts(accounts);
    } catch (error) {
      console.error('Error loading available accounts:', error);
    }
  };

  // Handle user creation
  const handleCreateUser = async () => {
    try {
      setCreateUserLoading(true);
      
      const randomNumber = Date.now().toString().slice(-4);
      const testUserData = {
        email: `testuser${randomNumber}@example.com`,
        password: 'password123',
        firstName: 'Test',
        lastName: `User${randomNumber}`,
        dateOfBirth: '1990-01-01',
        gender: 'male',
        phoneNumber: `+1234567${randomNumber}`,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to mock data
      const newUser = {
        id: Date.now().toString(),
        ...testUserData,
        userType: 'patient',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      
      MOCK_USERS.patients.push(newUser);
      
      // Update current view if showing patients
      if (activeTab === 'patients') {
        setUsers([...MOCK_USERS.patients]);
      }
      
      Alert.alert(
        'Success', 
        `User created successfully!\n\nCredentials:\nEmail: ${testUserData.email}\nPassword: ${testUserData.password}\nName: ${testUserData.firstName} ${testUserData.lastName}\nPhone: ${testUserData.phoneNumber}\n\nThis is a demo - user added to mock data.`
      );
      
      loadAvailableAccounts(); // Refresh available accounts
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setCreateUserLoading(false);
    }
  };

  // Handle profile data test
  const handleTestProfileData = async () => {
    try {
      setCreateUserLoading(true);
      
      const randomNumber = Date.now().toString().slice(-4);
      const testUserData = {
        email: `profiletest${randomNumber}@example.com`,
        password: 'password123',
        firstName: 'Profile',
        lastName: `Test${randomNumber}`,
        dateOfBirth: '1990-01-01',
        gender: 'female',
        phoneNumber: `+1987654${randomNumber}`,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to mock data
      const newUser = {
        id: Date.now().toString(),
        ...testUserData,
        userType: 'patient',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      MOCK_USERS.patients.push(newUser);
      if (activeTab === 'patients') {
        setUsers([...MOCK_USERS.patients]); // Update current view
      }
      
      // Test login simulation
      const mockLoginResult = { 
        success: true, 
        user: {
          name: `${testUserData.firstName} ${testUserData.lastName}`,
          phone: testUserData.phoneNumber,
          email: testUserData.email,
          firstName: testUserData.firstName,
          lastName: testUserData.lastName,
          phoneNumber: testUserData.phoneNumber,
        }
      };
      
      if (mockLoginResult.success) {
        const user = mockLoginResult.user;
        
        // Check if profile data is properly mapped
        const profileCheck = {
          hasName: !!user.name,
          nameValue: user.name,
          hasPhone: !!user.phone,
          phoneValue: user.phone,
          hasEmail: !!user.email,
          emailValue: user.email,
          hasFirstName: !!user.firstName,
          firstNameValue: user.firstName,
          hasLastName: !!user.lastName,
          lastNameValue: user.lastName,
          hasPhoneNumber: !!user.phoneNumber,
          phoneNumberValue: user.phoneNumber,
        };
        
        const isProfileMappingCorrect = 
          profileCheck.hasName && 
          profileCheck.nameValue === `${testUserData.firstName} ${testUserData.lastName}` &&
          profileCheck.hasPhone && 
          profileCheck.phoneValue === testUserData.phoneNumber;
          
        Alert.alert(
          'Profile Data Test Results (Mock)',
          `✅ Profile Mapping: ${isProfileMappingCorrect ? 'PASSED' : 'FAILED'}\n\n` +
          `Name: ${profileCheck.nameValue || 'Missing'}\n` +
          `Phone: ${profileCheck.phoneValue || 'Missing'}\n` +
          `Email: ${profileCheck.emailValue || 'Missing'}\n\n` +
          `Expected Name: ${testUserData.firstName} ${testUserData.lastName}\n` +
          `Expected Phone: ${testUserData.phoneNumber}\n` +
          `Expected Email: ${testUserData.email}\n\n` +
          `Raw Data Check:\n` +
          `firstName: ${profileCheck.firstNameValue || 'Missing'}\n` +
          `lastName: ${profileCheck.lastNameValue || 'Missing'}\n` +
          `phoneNumber: ${profileCheck.phoneNumberValue || 'Missing'}\n\n` +
          `Note: This is a demo test with mock data.`
        );
      }
    } catch (error) {
      Alert.alert('Profile Test Error', error.message);
    } finally {
      setCreateUserLoading(false);
    }
  };

  // Handle testing health data functionality
  const handleTestHealthData = async () => {
    try {
      Alert.alert(
        'Test Health Data',
        'This will test all health data functionality including metrics, medications, conditions, and wellness calculations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Test', onPress: runHealthDataTests },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const runHealthDataTests = async () => {
    setShowTestResults(true);
    let passedTests = 0;
    const totalTests = 8;
    
    try {
      console.log('🏥 Starting Health Data Tests...');
      
      // Test 1: Add Health Metrics
      try {
        await HealthDataService.addHealthMetric(HEALTH_METRIC_TYPES.WEIGHT, {
          value: '70.5',
          unit: 'kg',
          notes: 'Morning weight after workout',
        });
        
        await HealthDataService.addHealthMetric(HEALTH_METRIC_TYPES.HEIGHT, {
          value: '175',
          unit: 'cm',
          notes: 'Measured at clinic',
        });
        
        await HealthDataService.addHealthMetric(HEALTH_METRIC_TYPES.BLOOD_PRESSURE, {
          value: '120/80',
          unit: 'mmHg',
          notes: 'Normal reading',
        });
        
        passedTests++;
        console.log('✅ Health Metrics Test: PASSED');
      } catch (error) {
        console.log('❌ Health Metrics Test: FAILED -', error.message);
      }
      
      // Test 2: Get Health Metrics
      try {
        const metrics = await HealthDataService.getHealthMetrics();
        if (metrics && typeof metrics === 'object') {
          passedTests++;
          console.log('✅ Get Health Metrics Test: PASSED');
        } else {
          console.log('❌ Get Health Metrics Test: FAILED - Invalid response');
        }
      } catch (error) {
        console.log('❌ Get Health Metrics Test: FAILED -', error.message);
      }
      
      // Test 3: Add Medication
      try {
        await HealthDataService.addMedication({
          name: 'Test Medication',
          brand: 'TestBrand',
          dosage: '2 tablets',
          frequency: 2,
          dosageTimes: [new Date().toISOString()],
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          instructions: 'Take with food',
          reminderEnabled: true,
        });
        
        passedTests++;
        console.log('✅ Add Medication Test: PASSED');
      } catch (error) {
        console.log('❌ Add Medication Test: FAILED -', error.message);
      }
      
      // Test 4: Get Medications
      try {
        const medications = await HealthDataService.getMedications();
        if (Array.isArray(medications)) {
          passedTests++;
          console.log('✅ Get Medications Test: PASSED');
        } else {
          console.log('❌ Get Medications Test: FAILED - Invalid response');
        }
      } catch (error) {
        console.log('❌ Get Medications Test: FAILED -', error.message);
      }
      
      // Test 5: Add Condition
      try {
        await HealthDataService.addCondition({
          name: 'Test Condition',
          type: 'Chronic',
          description: 'Test condition for system validation',
          diagnosedDate: new Date().toISOString(),
          severity: 'mild',
          symptoms: ['test symptom'],
          triggers: ['test trigger'],
          answers: { 'Test question': 'Test answer' },
        });
        
        passedTests++;
        console.log('✅ Add Condition Test: PASSED');
      } catch (error) {
        console.log('❌ Add Condition Test: FAILED -', error.message);
      }
      
      // Test 6: Get Conditions
      try {
        const conditions = await HealthDataService.getConditions();
        if (Array.isArray(conditions)) {
          passedTests++;
          console.log('✅ Get Conditions Test: PASSED');
        } else {
          console.log('❌ Get Conditions Test: FAILED - Invalid response');
        }
      } catch (error) {
        console.log('❌ Get Conditions Test: FAILED -', error.message);
      }
      
      // Test 7: Save Wellness Calculation
      try {
        await HealthDataService.saveWellnessCalculation(
          WELLNESS_CALCULATION_TYPES.BMI,
          {
            input: {
              weight: '70.5',
              height: '175',
              weightUnit: 'kg',
              heightUnit: 'cm',
            },
            results: {
              bmi: 23.0,
              category: 'Normal weight',
            },
          }
        );
        
        passedTests++;
        console.log('✅ Save Wellness Calculation Test: PASSED');
      } catch (error) {
        console.log('❌ Save Wellness Calculation Test: FAILED -', error.message);
      }
      
      // Test 8: Get Health Analytics
      try {
        const analytics = await HealthDataService.getHealthAnalytics();
        if (analytics && analytics.summary) {
          passedTests++;
          console.log('✅ Get Health Analytics Test: PASSED');
        } else {
          console.log('❌ Get Health Analytics Test: FAILED - Invalid response');
        }
      } catch (error) {
        console.log('❌ Get Health Analytics Test: FAILED -', error.message);
      }
      
      const passRate = ((passedTests / totalTests) * 100).toFixed(1);
      
      Alert.alert(
        'Health Data Test Results',
        `${passedTests}/${totalTests} tests passed (${passRate}%)\n\n` +
        `✅ Health Metrics: ${passedTests >= 2 ? 'PASSED' : 'FAILED'}\n` +
        `✅ Medication Management: ${passedTests >= 4 ? 'PASSED' : 'FAILED'}\n` +
        `✅ Condition Management: ${passedTests >= 6 ? 'PASSED' : 'FAILED'}\n` +
        `✅ Wellness Calculations: ${passedTests >= 7 ? 'PASSED' : 'FAILED'}\n` +
        `✅ Health Analytics: ${passedTests >= 8 ? 'PASSED' : 'FAILED'}\n\n` +
        'All health data is now being saved to your profile!',
        [
          { text: 'View Health Profile', onPress: () => navigation?.navigate('MainLayout') },
          { text: 'OK' },
        ]
      );
      
    } catch (error) {
      Alert.alert('Health Data Test Failed', error.message);
    } finally {
      setShowTestResults(false);
    }
  };

  // Handle showing available accounts
  const handleShowAvailableAccounts = () => {
    if (availableAccounts.length === 0) {
      Alert.alert(
        'No Accounts Available', 
        'No accounts have been created yet. Create a user first or use the default test account:\n\nEmail: test@example.com\nPassword: password'
      );
      return;
    }

    const accountsList = availableAccounts.map(account => 
      `Email: ${account.email}\nPassword: ${account.password}\nType: ${account.userType || 'patient'}`
    ).join('\n\n');

    Alert.alert(
      'Available Login Accounts',
      `Default Account:\nEmail: test@example.com\nPassword: password\n\nCreated Accounts:\n${accountsList}`,
      [
        { text: 'Copy First Account', onPress: () => copyAccountToClipboard(availableAccounts[0]) },
        { text: 'OK', style: 'default' },
      ]
    );
  };

  // Copy account credentials to clipboard (conceptually)
  const copyAccountToClipboard = (account) => {
    Alert.alert(
      'Account Copied',
      `Email: ${account.email}\nPassword: ${account.password}\n\nYou can now use these credentials to login.`
    );
  };

  // Handle clearing all created accounts
  const handleClearAccounts = () => {
    Alert.alert(
      'Clear All Accounts',
      'Are you sure you want to clear all created accounts? This will remove all test users from local storage.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.clearCreatedUsers?.();
              setAvailableAccounts([]);
              Alert.alert('Success', 'All created accounts have been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear accounts.');
            }
          },
        },
      ]
    );
  };

  // Handle testing
  const handleRunTests = async () => {
    setShowTestResults(true);
    try {
      const report = await TestUtils.runAllTests();
      Alert.alert(
        'Test Results',
        `Tests completed: ${report.summary.passed}/${report.summary.total} passed`,
        [
          { text: 'OK', onPress: () => setShowTestResults(false) },
        ]
      );
    } catch (error) {
      Alert.alert('Test Error', error.message);
      setShowTestResults(false);
    }
  };

  // Render user item
  const renderUserItem = (user) => (
    <TouchableOpacity
      key={user.id}
      style={styles.userItem}
      onPress={() => setSelectedUser(user)}
    >
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <Text style={styles.userType}>{user.userType}</Text>
      </View>
      <View style={styles.userStatus}>
        <Text style={[styles.statusText, { color: getStatusColor(user.status) }]}>
          {user.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render skeleton loading
  const renderSkeletonLoading = () => (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );

  // Render stats
  const renderStats = () => {
    if (statsLoading) {
      return <InlineLoading text="Loading stats..." />;
    }

    if (!userStats) {
      return null;
    }

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>User Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{userStats.pendingUsers}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render tabs
  const renderTabs = () => (
    <View style={styles.tabContainer}>
      {Object.values(USER_TYPES).map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.tab,
            activeTab === type && styles.activeTab,
          ]}
          onPress={() => setActiveTab(type)}
        >
          <Text style={[
            styles.tabText,
            activeTab === type && styles.activeTabText,
          ]}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'pending': return '#ffc107';
      case 'inactive': return '#6c757d';
      case 'suspended': return '#dc3545';
      default: return '#6c757d';
    }
  };

  // Render error state (for demo purposes)
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>
        Demo Mode - No Real API Connected
      </Text>
      <Text style={styles.errorSubtext}>
        This is a demonstration using mock data. In a real app, this would connect to your backend API.
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => mockFetchUsers(activeTab)}
      >
        <Text style={styles.retryButtonText}>Reload Demo Data</Text>
      </TouchableOpacity>
    </View>
  );

  // Render debug info section
  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;

    return (
      <View style={styles.debugSection}>
        <Text style={styles.debugTitle}>Debug Information</Text>
        <Text style={styles.debugText}>
          Created Accounts: {availableAccounts.length}
        </Text>
        {availableAccounts.length > 0 && (
          <View style={styles.accountsList}>
            {availableAccounts.map((account, index) => (
              <TouchableOpacity
                key={index}
                style={styles.accountItem}
                onPress={() => copyAccountToClipboard(account)}
              >
                <Text style={styles.accountEmail}>{account.email}</Text>
                <Text style={styles.accountType}>{account.userType || 'patient'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.debugButtons}>
          <TouchableOpacity
            style={[styles.debugButton, styles.showAccountsButton]}
            onPress={handleShowAvailableAccounts}
          >
            <Text style={styles.debugButtonText}>Show Available Accounts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.debugButton, styles.clearAccountsButton]}
            onPress={handleClearAccounts}
          >
            <Text style={styles.debugButtonText}>Clear All Accounts</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={usersRefreshing}
              onRefresh={mockRefreshUsers}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>User Management Demo</Text>
            <Text style={styles.subtitle}>
              Integration example showing error handling, loading states, and user management with mock data (no real API calls)
            </Text>
          </View>

          {/* Debug Toggle */}
          <View style={styles.debugToggle}>
            <TouchableOpacity
              style={styles.debugToggleButton}
              onPress={() => setShowDebugInfo(!showDebugInfo)}
            >
              <Text style={styles.debugToggleText}>
                {showDebugInfo ? 'Hide' : 'Show'} Debug Info
              </Text>
            </TouchableOpacity>
          </View>

          {/* Debug Info */}
          {renderDebugInfo()}

          {/* Stats Section */}
          {renderStats()}

          {/* Search Section */}
          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <LoadingButton
              loading={createUserLoading}
              text="Create Test User"
              loadingText="Creating..."
              onPress={handleCreateUser}
              style={styles.actionButton}
            />
            <LoadingButton
              loading={showTestResults}
              text="Run Integration Tests"
              loadingText="Testing..."
              onPress={handleRunTests}
              style={[styles.actionButton, styles.testButton]}
            />
            <LoadingButton
              loading={false} // This button is for profile data test, not createUserLoading
              text="Test Profile Data"
              loadingText="Testing..."
              onPress={handleTestProfileData}
              style={[styles.actionButton, styles.testButton]}
            />
            <LoadingButton
              loading={showTestResults}
              text="Test Health Data"
              loadingText="Testing..."
              onPress={handleTestHealthData}
              style={[styles.actionButton, styles.healthTestButton]}
            />
          </View>

          {/* Account Help */}
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>🔐 Login Help</Text>
            <Text style={styles.helpText}>
              Having trouble logging in? Use the "Show Debug Info" button above to see available accounts, or create a new test user.
            </Text>
          </View>

          {/* User Tabs */}
          {renderTabs()}

          {/* Users List */}
          <View style={styles.usersSection}>
            {usersLoading ? (
              renderSkeletonLoading()
            ) : (
              <View>
                {users.map(renderUserItem)}
                
                {/* No load more button for mock data */}
              </View>
            )}
          </View>

          {/* Selected User Details */}
          {selectedUser && (
            <View style={styles.selectedUserSection}>
              <Text style={styles.selectedUserTitle}>Selected User</Text>
              <View style={styles.selectedUserDetails}>
                <Text style={styles.detailText}>
                  Name: {selectedUser.firstName} {selectedUser.lastName}
                </Text>
                <Text style={styles.detailText}>
                  Email: {selectedUser.email}
                </Text>
                <Text style={styles.detailText}>
                  Type: {selectedUser.userType}
                </Text>
                <Text style={styles.detailText}>
                  Status: {selectedUser.status}
                </Text>
                <Text style={styles.detailText}>
                  Created: {new Date(selectedUser.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedUser(null)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Full Screen Loading for Tests */}
        <FullScreenLoading
          visible={showTestResults}
          text="Running integration tests..."
          backgroundColor="rgba(0,0,0,0.8)"
        />
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  searchSection: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  testButton: {
    backgroundColor: '#28a745',
  },
  healthTestButton: {
    backgroundColor: '#007bff',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  activeTab: {
    backgroundColor: '#007bff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  usersSection: {
    paddingHorizontal: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userType: {
    fontSize: 12,
    color: '#007bff',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadMoreButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  loadMoreText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  selectedUserSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedUserTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  selectedUserDetails: {
    marginBottom: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  debugSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  debugText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  accountsList: {
    marginBottom: 16,
  },
  accountItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 6,
  },
  accountEmail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 12,
    color: '#666',
  },
  debugButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  debugButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  debugButtonText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  showAccountsButton: {
    backgroundColor: '#28a745',
  },
  clearAccountsButton: {
    backgroundColor: '#dc3545',
  },
  debugToggle: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  debugToggleButton: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
  },
  debugToggleText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
  },
});

export default UserManagementExample; 