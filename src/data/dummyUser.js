// This file contains dummy user data for testing the authentication flow
// In a real app, this data would come from the server

export const dummyUserData = {
  _id: '60c72b2d9b1d8b2d1c9b4567',
  name: 'John Doe',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+234 8012345678',
  phoneNumber: '+234 8012345678',
  roles: ['USER'],
  userType: 'patient',
  profilePicture: null,
  createdAt: '2023-04-15T10:30:00.000Z',
  updatedAt: '2023-04-15T10:30:00.000Z',
};

export const dummyAuthResponse = {
  data: {
    user: {
      _id: '60c72b2d9b1d8b2d1c9b4567',
      name: 'John Doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+234 8012345678',
      phoneNumber: '+234 8012345678',
      roles: ['USER'],
      userType: 'patient',
      profilePicture: null,
      createdAt: '2023-04-15T10:30:00.000Z',
      updatedAt: '2023-04-15T10:30:00.000Z',
    },
    tokens: {
      accessToken: 'dummy_access_token_123',
      refreshToken: 'dummy_refresh_token_456',
    },
  },
};

export default {
  dummyUserData,
  dummyAuthResponse,
}; 