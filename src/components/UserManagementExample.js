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
import { useApi, usePaginatedApi, useFormApi } from '../hooks/useApi';
import UserManagementService, { USER_TYPES } from '../services/UserManagementService';
import AuthService, { getCreatedUsers, clearCreatedUsers } from '../services/AuthService';
import TestUtils from '../utils/testUtils';

/**
 * Example component demonstrating the complete integration
 * Shows how to use error boundaries, loading states, API hooks, and user management
 */
const UserManagementExample = () => {
  const [activeTab, setActiveTab] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showTestResults, setShowTestResults] = useState(false);
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Using our custom hooks for different scenarios
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    refreshing: usersRefreshing,
    fetchData: fetchUsers,
    refresh: refreshUsers,
    loadMore: loadMoreUsers,
    hasMore: hasMoreUsers,
  } = usePaginatedApi(
    ({ page, limit }) => UserManagementService.getUsersByType(activeTab, page, limit),
    []
  );

  const {
    data: userStats,
    loading: statsLoading,
    execute: fetchStats,
  } = useApi(
    () => UserManagementService.getUserStats(),
    null,
    true // Execute on mount
  );

  const {
    loading: createUserLoading,
    error: createUserError,
    success: createUserSuccess,
    submit: createUser,
    reset: resetCreateUser,
  } = useFormApi(
    (userData) => UserManagementService.createUser(userData, USER_TYPES.PATIENT)
  );

  // Load users when tab changes
  useEffect(() => {
    fetchUsers(1);
  }, [activeTab, fetchUsers]);

  // Load available accounts for debugging
  useEffect(() => {
    loadAvailableAccounts();
  }, []);

  // Function to load available accounts
  const loadAvailableAccounts = async () => {
    try {
      const accounts = await getCreatedUsers();
      setAvailableAccounts(accounts);
    } catch (error) {
      console.error('Error loading available accounts:', error);
    }
  };

  // Handle user creation
  const handleCreateUser = async () => {
    try {
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

      await createUser(testUserData);
      Alert.alert(
        'Success', 
        `User created successfully!\n\nCredentials:\nEmail: ${testUserData.email}\nPassword: ${testUserData.password}\nName: ${testUserData.firstName} ${testUserData.lastName}\nPhone: ${testUserData.phoneNumber}\n\nYou can now login with these credentials.`
      );
      refreshUsers();
      loadAvailableAccounts(); // Refresh available accounts
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Handle profile data test
  const handleTestProfileData = async () => {
    try {
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

      // Create user
      await createUser(testUserData);
      
      // Test login
      const loginResult = await AuthService.login(testUserData.email, testUserData.password);
      
      if (loginResult.success) {
        const user = loginResult.user;
        
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
          'Profile Data Test Results',
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
          `phoneNumber: ${profileCheck.phoneNumberValue || 'Missing'}`
        );
        
        // Logout after test
        await AuthService.logout();
      }
    } catch (error) {
      Alert.alert('Profile Test Error', error.message);
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
              await clearCreatedUsers();
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
            {type.charAt(0).toUpperCase() + type.slice(1)}s
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
              onRefresh={refreshUsers}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>
              Comprehensive integration example with error handling, loading states, and API management
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
            ) : usersError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Error: {usersError.message}
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => fetchUsers(1)}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                {users.map(renderUserItem)}
                
                {hasMoreUsers && (
                  <TouchableOpacity
                    style={styles.loadMoreButton}
                    onPress={loadMoreUsers}
                  >
                    <Text style={styles.loadMoreText}>Load More</Text>
                  </TouchableOpacity>
                )}
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