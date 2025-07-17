export const mockProfessionals = [
  {
    id: '1',
    type: 'doctor',
    firstName: 'John',
    lastName: 'Smith',
    email: 'ikotnsikak@gmail.com',
    password: 'Doctor123!', // In a real app, this would be hashed
    phone: '+2348012345678',
    licenseNumber: 'MD123456',
    specialization: 'Cardiology',
    yearsOfExperience: '15',
    certifications: [
      {
        id: 'cert1',
        name: 'Board Certification in Cardiology',
        issueDate: '2015-06-15',
        expiryDate: '2025-06-15',
      },
    ],
    workingHours: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
    },
    appointments: [
      {
        id: 'apt1',
        patientId: 'p1',
        date: '2024-03-20',
        time: '10:00',
        status: 'scheduled',
        type: 'consultation',
      },
      {
        id: 'apt2',
        patientId: 'p2',
        date: '2024-03-20',
        time: '11:00',
        status: 'scheduled',
        type: 'follow-up',
      },
    ],
    earnings: {
      total: 250000,
      pending: 15000,
      lastPayout: '2024-02-28',
    },
  },
  {
    id: '2',
    type: 'pharmacist',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@carepoint.com',
    password: 'Pharm123!',
    phone: '+2348023456789',
    licenseNumber: 'PH789012',
    specialization: 'Clinical Pharmacy',
    yearsOfExperience: '8',
    certifications: [
      {
        id: 'cert2',
        name: 'Advanced Pharmacy Practice',
        issueDate: '2018-03-10',
        expiryDate: '2028-03-10',
      },
    ],
    workingHours: {
      monday: { start: '08:00', end: '16:00' },
      tuesday: { start: '08:00', end: '16:00' },
      wednesday: { start: '08:00', end: '16:00' },
      thursday: { start: '08:00', end: '16:00' },
      friday: { start: '08:00', end: '16:00' },
    },
    prescriptions: [
      {
        id: 'rx1',
        patientId: 'p1',
        date: '2024-03-19',
        status: 'pending',
        medications: [
          {
            name: 'Amoxicillin',
            dosage: '500mg',
            frequency: '3 times daily',
            duration: '7 days',
          },
        ],
      },
    ],
    earnings: {
      total: 180000,
      pending: 8000,
      lastPayout: '2024-02-28',
    },
  },
  {
    id: '3',
    type: 'doctor',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@carepoint.com',
    password: 'Doctor456!',
    phone: '+2348034567890',
    licenseNumber: 'MD789012',
    specialization: 'Pediatrics',
    yearsOfExperience: '12',
    certifications: [
      {
        id: 'cert3',
        name: 'Pediatric Board Certification',
        issueDate: '2016-08-20',
        expiryDate: '2026-08-20',
      },
    ],
    workingHours: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' },
    },
    appointments: [
      {
        id: 'apt3',
        patientId: 'p3',
        date: '2024-03-20',
        time: '14:00',
        status: 'scheduled',
        type: 'consultation',
      },
    ],
    earnings: {
      total: 220000,
      pending: 12000,
      lastPayout: '2024-02-28',
    },
  },
];

// Helper function to find a professional by email and password
export const findProfessionalByCredentials = (email, password) => {
  return mockProfessionals.find(
    (prof) => prof.email === email && prof.password === password
  );
};

// Helper function to get professional by ID
export const getProfessionalById = (id) => {
  return mockProfessionals.find((prof) => prof.id === id);
};

// Helper function to get all professionals of a specific type
export const getProfessionalsByType = (type) => {
  return mockProfessionals.filter((prof) => prof.type === type);
}; 