// Shared appointments data for the entire app
// This ensures all screens use the same appointment data

// Helper function to get date strings for dynamic dates
const getDateString = (daysFromNow = 0) => {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return date.toISOString().split('T')[0];
};

// Helper function to get time string for testing
const getTestTimeString = (minutesFromNow) => {
  const date = new Date(Date.now() + minutesFromNow * 60 * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Mock appointments data
export const mockAppointments = {
  // Today's appointments
  [getDateString(0)]: [
    { 
      time: '09:00 AM', 
      patient: 'Judith Scoft', 
      type: 'Follow-up', 
      duration: '30 mins', 
      id: 'app1',
      patientId: 'patient_judith',
      status: 'accepted',
      notes: 'Follow-up appointment for blood pressure monitoring. Patient requested video consultation.',
      symptoms: ['Headaches', 'Dizziness', 'High Blood Pressure'],
      previousVisit: getDateString(-20),
      contactInfo: {
        phone: '+1 (555) 123-4567',
        email: 'judith.scoft@email.com'
      }
    },
    { 
      time: '10:00 AM', 
      patient: 'Samuel Cole', 
      type: 'New Patient', 
      duration: '45 mins', 
      id: 'app2',
      patientId: 'patient_samuel',
      status: 'pending',
      notes: 'New patient consultation. Initial assessment required.',
      symptoms: ['Chest Pain', 'Shortness of Breath'],
      previousVisit: null,
      contactInfo: {
        phone: '+1 (555) 987-6543',
        email: 'samuel.cole@email.com'
      }
    },
    { 
      time: '02:00 PM', 
      patient: 'Emma Thompson', 
      type: 'Video Call', 
      duration: '30 mins', 
      id: 'app15',
      patientId: 'patient_emma',
      status: 'pending',
      notes: 'Follow-up on medication effectiveness. Patient prefers video consultation.',
      symptoms: ['Medication Side Effects', 'Sleep Issues'],
      previousVisit: getDateString(-15),
      contactInfo: {
        phone: '+1 (555) 456-7890',
        email: 'emma.thompson@email.com'
      }
    },
    // TEST APPOINTMENT - This will be 6 minutes from now for testing notifications
    { 
      time: getTestTimeString(6), 
      patient: 'Test Patient', 
      type: 'Test Appointment', 
      duration: '15 mins', 
      id: 'app_test',
      patientId: 'patient_test',
      status: 'accepted',
      notes: 'This is a test appointment to verify notification system.',
      symptoms: ['Test Notification'],
      previousVisit: null,
      contactInfo: {
        phone: '+1 (555) 000-0000',
        email: 'test@example.com'
      }
    },
  ],
  // Tomorrow's appointments
  [getDateString(1)]: [
    { 
      time: '08:30 AM', 
      patient: 'Rose Nguyen', 
      type: 'Check-up', 
      duration: '30 mins', 
      id: 'app3',
      patientId: 'patient_rose',
      status: 'accepted',
      notes: 'Regular check-up appointment.',
      symptoms: ['General Health Check'],
      previousVisit: getDateString(-30),
      contactInfo: {
        phone: '+1 (555) 234-5678',
        email: 'rose.nguyen@email.com'
      }
    },
    { 
      time: '10:00 AM', 
      patient: 'Megan Reed', 
      type: 'In-Person', 
      duration: '45 mins', 
      id: 'app4',
      patientId: 'patient_megan',
      status: 'pending',
      notes: 'Physical examination required.',
      symptoms: ['Back Pain', 'Muscle Tension'],
      previousVisit: getDateString(-45),
      contactInfo: {
        phone: '+1 (555) 345-6789',
        email: 'megan.reed@email.com'
      }
    },
    { 
      time: '11:30 AM', 
      patient: 'Alex Parker', 
      type: 'Follow-up', 
      duration: '30 mins', 
      id: 'app16',
      patientId: 'patient_alex',
      status: 'accepted',
      notes: 'Follow-up on treatment progress.',
      symptoms: ['Recovery Progress'],
      previousVisit: getDateString(-14),
      contactInfo: {
        phone: '+1 (555) 456-7890',
        email: 'alex.parker@email.com'
      }
    },
    { 
      time: '02:00 PM', 
      patient: 'Sarah Johnson', 
      type: 'Video Call', 
      duration: '30 mins', 
      id: 'app17',
      patientId: 'patient_sarah',
      status: 'pending',
      notes: 'Remote consultation.',
      symptoms: ['Fatigue', 'Sleep Issues'],
      previousVisit: getDateString(-21),
      contactInfo: {
        phone: '+1 (555) 567-8901',
        email: 'sarah.johnson@email.com'
      }
    },
    { 
      time: '03:30 PM', 
      patient: 'Michael Chen', 
      type: 'Chat', 
      duration: '15 mins', 
      id: 'app18',
      patientId: 'patient_michael',
      status: 'accepted',
      notes: 'Quick consultation via chat.',
      symptoms: ['Prescription Refill'],
      previousVisit: getDateString(-7),
      contactInfo: {
        phone: '+1 (555) 678-9012',
        email: 'michael.chen@email.com'
      }
    },
  ],
  // Day after tomorrow
  [getDateString(2)]: [
    { 
      time: '09:00 AM', 
      patient: 'David Wilson', 
      type: 'New Patient', 
      duration: '60 mins', 
      id: 'app19',
      patientId: 'patient_david',
      status: 'pending',
      notes: 'Comprehensive new patient assessment.',
      symptoms: ['Comprehensive Assessment'],
      previousVisit: null,
      contactInfo: {
        phone: '+1 (555) 789-0123',
        email: 'david.wilson@email.com'
      }
    },
    { 
      time: '11:00 AM', 
      patient: 'Lisa Brown', 
      type: 'Check-up', 
      duration: '30 mins', 
      id: 'app20',
      patientId: 'patient_lisa',
      status: 'accepted',
      notes: 'Annual health check-up.',
      symptoms: ['Annual Physical'],
      previousVisit: getDateString(-365),
      contactInfo: {
        phone: '+1 (555) 890-1234',
        email: 'lisa.brown@email.com'
      }
    },
    { 
      time: '01:00 PM', 
      patient: 'Tom Anderson', 
      type: 'In-Person', 
      duration: '45 mins', 
      id: 'app21',
      patientId: 'patient_tom',
      status: 'pending',
      notes: 'Physical therapy consultation.',
      symptoms: ['Joint Pain', 'Mobility Issues'],
      previousVisit: getDateString(-10),
      contactInfo: {
        phone: '+1 (555) 901-2345',
        email: 'tom.anderson@email.com'
      }
    },
  ],
  // Future appointments (5 days from now)
  [getDateString(5)]: [
    { 
      time: '08:00 AM', 
      patient: 'Jennifer Davis', 
      type: 'Video Call', 
      duration: '30 mins', 
      id: 'app22',
      patientId: 'patient_jennifer',
      status: 'pending',
      notes: 'Remote follow-up consultation.',
      symptoms: ['Medication Review'],
      previousVisit: getDateString(-30),
      contactInfo: {
        phone: '+1 (555) 012-3456',
        email: 'jennifer.davis@email.com'
      }
    },
    { 
      time: '09:30 AM', 
      patient: 'Robert Taylor', 
      type: 'Follow-up', 
      duration: '30 mins', 
      id: 'app23',
      patientId: 'patient_robert',
      status: 'accepted',
      notes: 'Treatment progress review.',
      symptoms: ['Progress Check'],
      previousVisit: getDateString(-14),
      contactInfo: {
        phone: '+1 (555) 123-4567',
        email: 'robert.taylor@email.com'
      }
    },
    { 
      time: '11:00 AM', 
      patient: 'Emily White', 
      type: 'Check-up', 
      duration: '30 mins', 
      id: 'app24',
      patientId: 'patient_emily',
      status: 'pending',
      notes: 'Routine health examination.',
      symptoms: ['Routine Check'],
      previousVisit: getDateString(-90),
      contactInfo: {
        phone: '+1 (555) 234-5678',
        email: 'emily.white@email.com'
      }
    },
    { 
      time: '02:30 PM', 
      patient: 'James Miller', 
      type: 'In-Person', 
      duration: '45 mins', 
      id: 'app25',
      patientId: 'patient_james',
      status: 'accepted',
      notes: 'Comprehensive physical examination.',
      symptoms: ['Physical Exam'],
      previousVisit: getDateString(-60),
      contactInfo: {
        phone: '+1 (555) 345-6789',
        email: 'james.miller@email.com'
      }
    },
  ],
};

// Function to get appointment by ID
export const getAppointmentById = (appointmentId) => {
  for (const [date, appointments] of Object.entries(mockAppointments)) {
    const appointment = appointments.find(app => app.id === appointmentId);
    if (appointment) {
      return {
        ...appointment,
        date: date
      };
    }
  }
  return null;
};

// Function to get today's appointments
export const getTodaysAppointments = () => {
  const today = getDateString(0);
  const appointments = mockAppointments[today] || [];
  
  // Add the date field to each appointment for notification service compatibility
  return appointments.map(appointment => ({
    ...appointment,
    date: today
  }));
};

// Function to get appointments for a specific date
export const getAppointmentsForDate = (dateString) => {
  const appointments = mockAppointments[dateString] || [];
  
  // Add the date field to each appointment for consistency
  return appointments.map(appointment => ({
    ...appointment,
    date: dateString
  }));
};

// Function to get all appointments as a flat array with dates
export const getAllAppointments = () => {
  const allAppointments = [];
  for (const [date, appointments] of Object.entries(mockAppointments)) {
    appointments.forEach(appointment => {
      allAppointments.push({
        ...appointment,
        date: date
      });
    });
  }
  return allAppointments;
};

export default mockAppointments; 