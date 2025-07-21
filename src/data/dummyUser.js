// This file contains dummy user data for testing the authentication flow
// In a real app, this data would come from the server

export const dummyUserData = {
  _id: 'patient_sageikot',
  id: 'patient_sageikot',
  name: 'Sageikot',
  firstName: 'Sage',
  lastName: 'Ikot',
  email: 'sageikot@gmail.com',
  phone: '+234 803 123 4567',
  phoneNumber: '+234 803 123 4567',
  roles: ['PATIENT'],
  userType: 'patient',
  profilePicture: null,
  dateOfBirth: '1990-05-15',
  gender: 'male',
  bloodType: 'O+',
  address: '123 Health Street, Lagos, Nigeria',
  emergencyContact: {
    name: 'Jane Ikot',
    phone: '+234 803 987 6543',
    relationship: 'Sister',
  },
  createdAt: '2023-04-15T10:30:00.000Z',
  updatedAt: '2023-04-15T10:30:00.000Z',
};

// Dr. John Smith data for role switching
export const dummyDoctorData = {
  _id: '1',
  id: '1',
  name: 'Dr. John Smith',
  firstName: 'John',
  lastName: 'Smith',
  email: 'ikotnsikak@gmail.com',
  phone: '+234 801 234 5678',
  phoneNumber: '+234 801 234 5678',
  roles: ['DOCTOR'],
  userType: 'doctor',
  profilePicture: null,
  specialization: 'Cardiology',
  licenseNumber: 'MD123456',
  yearsOfExperience: 15,
  qualifications: [
    'Doctor of Medicine (MD) - University of Lagos',
    'Fellowship in Cardiology - Johns Hopkins',
    'Board Certified Cardiologist',
  ],
  hospital: 'Lagos University Teaching Hospital',
  consultationFee: 15000,
  availability: {
    monday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    thursday: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
    friday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
  },
  createdAt: '2020-01-15T10:30:00.000Z',
  updatedAt: '2023-04-15T10:30:00.000Z',
};

// Combined user data for easy switching
export const userData = {
  patient: dummyUserData,
  doctor: dummyDoctorData,
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