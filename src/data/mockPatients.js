export const mockPatients = [
  {
    id: 'p1',
    firstName: 'Emma',
    lastName: 'Wilson',
    email: 'emma.wilson@example.com',
    phone: '+2348045678901',
    dateOfBirth: '1985-06-15',
    gender: 'female',
    bloodType: 'O+',
    medicalHistory: [
      {
        condition: 'Hypertension',
        diagnosed: '2020-03-15',
        status: 'controlled',
        medications: ['Lisinopril 10mg'],
      },
    ],
    appointments: [
      {
        id: 'apt1',
        professionalId: '1',
        date: '2024-03-20',
        time: '10:00',
        status: 'scheduled',
        type: 'consultation',
      },
    ],
    prescriptions: [
      {
        id: 'rx1',
        professionalId: '2',
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
  },
  {
    id: 'p2',
    firstName: 'James',
    lastName: 'Brown',
    email: 'james.brown@example.com',
    phone: '+2348056789012',
    dateOfBirth: '1978-09-23',
    gender: 'male',
    bloodType: 'A+',
    medicalHistory: [
      {
        condition: 'Type 2 Diabetes',
        diagnosed: '2018-11-05',
        status: 'controlled',
        medications: ['Metformin 1000mg'],
      },
    ],
    appointments: [
      {
        id: 'apt2',
        professionalId: '1',
        date: '2024-03-20',
        time: '11:00',
        status: 'scheduled',
        type: 'follow-up',
      },
    ],
    prescriptions: [],
  },
  {
    id: 'p3',
    firstName: 'Sophia',
    lastName: 'Martinez',
    email: 'sophia.martinez@example.com',
    phone: '+2348067890123',
    dateOfBirth: '2015-04-12',
    gender: 'female',
    bloodType: 'B+',
    medicalHistory: [
      {
        condition: 'Asthma',
        diagnosed: '2018-07-20',
        status: 'controlled',
        medications: ['Albuterol Inhaler'],
      },
    ],
    appointments: [
      {
        id: 'apt3',
        professionalId: '3',
        date: '2024-03-20',
        time: '14:00',
        status: 'scheduled',
        type: 'consultation',
      },
    ],
    prescriptions: [],
  },
];

// Helper function to find a patient by ID
export const getPatientById = (id) => {
  return mockPatients.find((patient) => patient.id === id);
};

// Helper function to get patients by professional ID
export const getPatientsByProfessionalId = (professionalId) => {
  return mockPatients.filter((patient) =>
    patient.appointments.some((apt) => apt.professionalId === professionalId)
  );
};

// Helper function to get patient appointments by professional ID
export const getPatientAppointmentsByProfessionalId = (professionalId) => {
  const appointments = [];
  mockPatients.forEach((patient) => {
    patient.appointments.forEach((apt) => {
      if (apt.professionalId === professionalId) {
        appointments.push({
          ...apt,
          patient: {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
          },
        });
      }
    });
  });
  return appointments;
}; 