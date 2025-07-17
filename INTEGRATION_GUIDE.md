# Frontend-Backend Integration Guide

This guide covers the comprehensive integration implementation for the PMS Mobile application, including error handling, loading states, token management, and testing utilities.

## Overview

The integration includes:
- **Error Handling**: Error boundaries and comprehensive error management
- **Data Transformation**: Backend response handling and data processing
- **Token Management**: Automatic token refresh and authentication flow
- **Loading States**: Various loading components and states
- **User Management**: Complete user creation and management for all user types
- **Testing**: Comprehensive testing utilities for integration validation

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Service](#api-service)
3. [Error Handling](#error-handling)
4. [Loading States](#loading-states)
5. [Custom Hooks](#custom-hooks)
6. [User Management](#user-management)
7. [Testing](#testing)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Import Required Components

```javascript
import ErrorBoundary from '../components/ErrorBoundary';
import { FullScreenLoading, LoadingButton } from '../components/LoadingState';
import { useApi, useFormApi } from '../hooks/useApi';
import UserManagementService, { USER_TYPES } from '../services/UserManagementService';
```

### 2. Basic Usage Example

```javascript
const MyComponent = () => {
  const { data, loading, error, execute } = useApi(
    () => UserManagementService.getUsersByType(USER_TYPES.PATIENT),
    [],
    true // Execute on mount
  );

  return (
    <ErrorBoundary>
      <View>
        {loading ? (
          <FullScreenLoading text="Loading users..." />
        ) : error ? (
          <Text>Error: {error.message}</Text>
        ) : (
          <FlatList data={data} renderItem={renderUser} />
        )}
      </View>
    </ErrorBoundary>
  );
};
```

## API Service

### Enhanced Features

The `ApiService` provides:
- **Automatic token refresh** when tokens expire
- **Request/response transformation** based on backend structure
- **Comprehensive error handling** with user-friendly messages
- **Retry logic** for retryable errors
- **Development logging** for debugging

### Response Structure

All API responses follow this structure:
```javascript
{
  success: true,
  message: "Operation successful",
  data: { /* actual data */ },
  statusCode: "10000"
}
```

### Error Handling

```javascript
try {
  const result = await ApiService.get('/users');
  // Handle success
} catch (error) {
  if (error.errorCode === 'NETWORK_ERROR') {
    // Handle network error
  } else if (error.errorCode === 'SESSION_EXPIRED') {
    // Handle session expiration
  } else if (error.isRetryable) {
    // Handle retryable errors
  }
}
```

## Error Handling

### Error Boundary Component

Wrap your components with `ErrorBoundary` to catch and handle errors gracefully:

```javascript
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Features

- **Automatic error logging** to local storage
- **User-friendly error messages** with retry options
- **Development mode** shows detailed error information
- **Error reporting** capability for production

### Custom Error Handling

```javascript
import { ApiError } from '../services/ApiService';

const handleApiError = (error) => {
  if (error instanceof ApiError) {
    switch (error.errorCode) {
      case 'NETWORK_ERROR':
        Alert.alert('Network Error', 'Please check your connection');
        break;
      case 'SESSION_EXPIRED':
        // Redirect to login
        break;
      default:
        Alert.alert('Error', error.message);
    }
  }
};
```

## Loading States

### Available Components

#### 1. FullScreenLoading
```javascript
<FullScreenLoading
  visible={loading}
  text="Loading..."
  backgroundColor="rgba(0,0,0,0.5)"
/>
```

#### 2. LoadingButton
```javascript
<LoadingButton
  loading={submitting}
  text="Submit"
  loadingText="Submitting..."
  onPress={handleSubmit}
/>
```

#### 3. SkeletonLoading
```javascript
<SkeletonItem height={80} />
<SkeletonContent lines={3} />
```

#### 4. InlineLoading
```javascript
<InlineLoading size="small" text="Loading..." />
```

### Usage Examples

```javascript
// Full screen loading
const [loading, setLoading] = useState(false);
<FullScreenLoading visible={loading} text="Creating user..." />

// Button loading
const { loading, submit } = useFormApi(createUserAPI);
<LoadingButton loading={loading} onPress={submit} text="Create User" />

// Skeleton loading for lists
{loading ? (
  <SkeletonItem />
) : (
  <UserListItem user={user} />
)}
```

## Custom Hooks

### useApi Hook

For general API calls with loading states:

```javascript
const { data, loading, error, execute, refresh, retry } = useApi(
  apiFunction,
  initialData,
  executeOnMount
);
```

### usePaginatedApi Hook

For paginated data:

```javascript
const {
  data,
  loading,
  loadingMore,
  refreshing,
  hasMore,
  fetchData,
  refresh,
  loadMore
} = usePaginatedApi(apiFunction, initialData);
```

### useFormApi Hook

For form submissions:

```javascript
const { loading, error, success, submit, reset } = useFormApi(apiFunction);
```

### useRealTimeApi Hook

For real-time data updates:

```javascript
const { data, loading, connected, start, stop } = useRealTimeApi(
  apiFunction,
  intervalMs
);
```

## User Management

### User Types

```javascript
import { USER_TYPES } from '../services/UserManagementService';

// Available types:
USER_TYPES.PATIENT
USER_TYPES.DOCTOR  
USER_TYPES.INSTITUTION
USER_TYPES.ADMIN
```

### Creating Users

```javascript
// Create a patient
const patientData = {
  email: 'patient@example.com',
  password: 'password123',
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  phoneNumber: '+1234567890',
};

const result = await UserManagementService.createUser(patientData, USER_TYPES.PATIENT);
```

### User-Specific Methods

```javascript
// Patient-specific
await UserManagementService.createPatientProfile(patientData);
await UserManagementService.updatePatientMedicalHistory(patientId, history);

// Doctor-specific
await UserManagementService.createDoctorProfile(doctorData);
await UserManagementService.updateDoctorSpecialization(doctorId, specs);

// Institution-specific
await UserManagementService.createInstitutionProfile(institutionData);
await UserManagementService.updateInstitutionServices(institutionId, services);
```

### Data Validation

```javascript
// Validate user data before creation
try {
  UserManagementService.validateUserData(userData, USER_TYPES.PATIENT);
  // Proceed with creation
} catch (error) {
  // Handle validation errors
}
```

## Testing

### Running Tests

```javascript
import TestUtils from '../utils/testUtils';

// Run all tests
const report = await TestUtils.runAllTests();

// Run specific tests
await TestUtils.testApiConnectivity();
await TestUtils.testAuthenticationFlow();
await TestUtils.testUserCreation();
await TestUtils.testErrorHandling();
```

### Test Categories

1. **API Connectivity** - Tests basic API connection
2. **Authentication Flow** - Tests login, token management
3. **User Creation** - Tests user creation for all types
4. **Error Handling** - Tests error scenarios
5. **Data Transformation** - Tests response processing
6. **Pagination** - Tests paginated API calls
7. **Token Refresh** - Tests automatic token refresh

### Performance Testing

```javascript
// Performance test
const performanceResult = await TestUtils.performanceTest('/users', 10);

// Load test
const loadResult = await TestUtils.loadTest('/users', 5);
```

### Test Reports

```javascript
const report = await TestUtils.runAllTests();
console.log(`Tests: ${report.summary.passed}/${report.summary.total} passed`);
console.log(`Pass rate: ${report.summary.passRate}%`);
```

## Best Practices

### 1. Error Handling
- Always wrap components in `ErrorBoundary`
- Use specific error handling for different error types
- Provide clear error messages to users
- Log errors for debugging

### 2. Loading States
- Use appropriate loading components for different scenarios
- Show skeleton loading for lists and content
- Use full-screen loading for critical operations
- Provide loading text that describes the action

### 3. API Calls
- Use custom hooks for consistent state management
- Handle loading, error, and success states
- Implement retry logic for retryable errors
- Use pagination for large datasets

### 4. User Management
- Validate user data before API calls
- Handle different user types appropriately
- Provide clear feedback for user actions
- Use proper authentication flow

### 5. Testing
- Test integration incrementally
- Use performance testing for optimization
- Monitor test results regularly
- Test error scenarios thoroughly

## Troubleshooting

### Common Issues

#### 1. Token Refresh Failures
```javascript
// Check if logout callback is set
import { setLogoutCallback } from '../services/ApiService';
setLogoutCallback(() => AuthService.logout());
```

#### 2. Network Errors
```javascript
// Handle network connectivity
if (error.errorCode === 'NETWORK_ERROR') {
  // Show offline message
  // Implement retry logic
}
```

#### 3. Loading State Issues
```javascript
// Ensure proper cleanup
useEffect(() => {
  return () => {
    // Cleanup loading states
  };
}, []);
```

#### 4. User Creation Validation
```javascript
// Check required fields for user type
const requiredFields = {
  [USER_TYPES.PATIENT]: ['dateOfBirth', 'gender'],
  [USER_TYPES.DOCTOR]: ['medicalLicense', 'specializations'],
  [USER_TYPES.INSTITUTION]: ['institutionName', 'address'],
};
```

### Debugging Tips

1. **Enable Development Logging**
   - Check console for API request/response logs
   - Review error details in development mode

2. **Use Test Utilities**
   - Run integration tests to identify issues
   - Use performance tests to optimize slow operations

3. **Check Network Tab**
   - Verify API endpoints are correct
   - Check request/response format

4. **Validate Data Format**
   - Ensure data matches expected backend format
   - Check for missing required fields

### Performance Optimization

1. **Pagination**
   - Use paginated APIs for large datasets
   - Implement virtual scrolling for long lists

2. **Caching**
   - Cache frequently accessed data
   - Implement proper cache invalidation

3. **Error Handling**
   - Avoid unnecessary error alerts
   - Use silent error handling where appropriate

4. **Loading States**
   - Use skeleton loading instead of spinners
   - Implement progressive loading

## Migration Guide

### From Existing Code

1. **Update API Service**
   - Replace existing API calls with new ApiService
   - Update error handling to use new error structure

2. **Add Error Boundaries**
   - Wrap existing components with ErrorBoundary
   - Update error handling logic

3. **Implement Loading States**
   - Replace existing loading indicators
   - Add skeleton loading for lists

4. **Update User Management**
   - Use new UserManagementService
   - Update user creation flow

5. **Add Testing**
   - Implement testing utilities
   - Add integration tests

### Breaking Changes

- API response structure has changed
- Error handling uses new error classes
- Loading states use new components
- User management requires new service

## Support

For issues or questions:
1. Check the troubleshooting section
2. Run integration tests to identify problems
3. Review console logs for error details
4. Check network connectivity and API endpoints 