import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mock data - In a real app, fetch this based on patientId
const mockPatientFullDetails = {
  p1: {
    id: 'p1',
    name: 'Judith Scoft',
    age: 46,
    gender: 'Female',
    bloodType: 'O+',
    contact: '555-0101',
    email: 'sageikot@gmail.com',
    address: '123 Health St, Wellness City',
    profilePicUrl: null,
    medicalHistory: [
      { date: '2024-02-12', type: 'Consultation', summary: 'Hypertension check-up', doctor: 'Dr. Amelia Stone' },
      { date: '2023-11-05', type: 'Lab Results', summary: 'Blood panel normal', doctor: 'Dr. Amelia Stone' },
    ],
    prescriptions: [
      { date: '2024-02-12', drug: 'Lisinopril 10mg', dosage: '1 daily', status: 'Active' },
    ],
    notes: [
      { date: '2024-02-12', note: 'Patient advised on diet and exercise for hypertension management.', author: 'Dr. Amelia Stone' },
    ],
    vitals: {
      height: '165cm',
      weight: '70kg',
      bp: '130/85 mmHg',
      temperature: '98.6°F',
    },
    currentMedication: ['Lisinopril 10mg', 'Aspirin 81mg'],
  },
  p2: {
    id: 'p2',
    name: 'Samuel Cole',
    age: 54,
    gender: 'Male',
    bloodType: 'A-',
    contact: '555-0102',
    email: 'samuel.cole@example.com',
    address: '456 Recovery Rd, Healthville',
    profilePicUrl: null,
    medicalHistory: [
      { date: '2024-02-16', type: 'Physiotherapy', summary: 'Initial assessment for back pain', doctor: 'Dr. Ben Carter' },
      { date: '2023-10-20', type: 'Check-up', summary: 'General wellness check', doctor: 'Dr. Amelia Stone' },
    ],
    prescriptions: [
      { date: '2024-02-16', drug: 'Ibuprofen 600mg', dosage: 'As needed for pain', status: 'Active' },
    ],
    notes: [
      { date: '2024-02-16', note: 'Patient reports chronic lower back pain. Referred for MRI.', author: 'Dr. Ben Carter' },
    ],
    vitals: {
      height: '178cm',
      weight: '85kg',
      bp: '120/80 mmHg',
      temperature: '98.4°F',
    },
    currentMedication: ['Ibuprofen 600mg'],
  },
  p3: {
    id: 'p3',
    name: 'Rose Nguyen',
    age: 73,
    gender: 'Female',
    bloodType: 'B+',
    contact: '555-0103',
    email: 'rose.nguyen@example.com',
    address: '789 Care Ave, Remedy Town',
    profilePicUrl: null,
    medicalHistory: [
      { date: '2024-02-26', type: 'Follow-up', summary: 'Discuss lab results, adjusting medication', doctor: 'Dr. Clara Dane' },
      { date: '2024-02-15', type: 'Lab Work', summary: 'Comprehensive metabolic panel', doctor: 'LabCorp' },
    ],
    prescriptions: [
      { date: '2024-02-26', drug: 'Metformin 500mg', dosage: '1 twice daily', status: 'Active' },
      { date: '2023-01-10', drug: 'Atorvastatin 20mg', dosage: '1 daily', status: 'Active' },
    ],
    notes: [
      { date: '2024-02-26', note: 'Patient A1C levels improved. Continue current Metformin dosage. Follow up in 3 months.', author: 'Dr. Clara Dane' },
    ],
    vitals: {
      height: '155cm',
      weight: '65kg',
      bp: '135/88 mmHg',
      temperature: '98.7°F',
    },
    currentMedication: ['Metformin 500mg', 'Atorvastatin 20mg'],
  },
  p4: {
    id: 'p4',
    name: 'Eugene Porter',
    age: 30,
    gender: 'Male',
    bloodType: 'AB+',
    contact: '555-0104',
    email: 'eugene.porter@example.com',
    address: '321 Remedy Row, Cure City',
    profilePicUrl: null,
    medicalHistory: [
      { date: '2024-01-25', type: 'Consultation', summary: 'Discussion about new medication options for anxiety.', doctor: 'Dr. Edward Falco' },
    ],
    prescriptions: [
      { date: '2024-01-25', drug: 'Sertraline 50mg', dosage: '1 daily', status: 'Active' },
    ],
    notes: [
      { date: '2024-01-25', note: 'Patient started on Sertraline for anxiety. Follow up in 4 weeks to monitor effects and side effects.', author: 'Dr. Edward Falco' },
    ],
    vitals: {
      height: '180cm',
      weight: '78kg',
      bp: '118/75 mmHg',
      temperature: '98.6°F',
    },
    currentMedication: ['Sertraline 50mg'],
  },
  p5: {
    id: 'p5',
    name: 'Martha Hayes',
    age: 67,
    gender: 'Female',
    bloodType: 'O-',
    contact: '555-0105',
    email: 'martha.hayes@example.com',
    address: '654 Wellness Way, Soothe Suburb',
    profilePicUrl: null,
    medicalHistory: [
      { date: '2024-02-20', type: 'Orthopedic Consult', summary: 'Assessment of chronic knee pain. X-rays taken.', doctor: 'Dr. Grace Lee' },
      { date: '2023-12-10', type: 'General Check-up', summary: 'Annual physical.', doctor: 'Dr. Amelia Stone' },
    ],
    prescriptions: [
      { date: '2024-02-20', drug: 'Celecoxib 200mg', dosage: '1 daily for knee pain', status: 'Active' },
    ],
    notes: [
      { date: '2024-02-20', note: 'Patient diagnosed with osteoarthritis in right knee. Prescribed Celecoxib. Discussed potential for joint injection if pain persists.', author: 'Dr. Grace Lee' },
    ],
    vitals: {
      height: '160cm',
      weight: '72kg',
      bp: '128/82 mmHg',
      temperature: '98.5°F',
    },
    currentMedication: ['Celecoxib 200mg', 'Calcium + Vit D'],
  },
  p6: {
    id: 'p6',
    name: 'Phillip Dawson',
    age: 51,
    gender: 'Male',
    bloodType: 'A+',
    contact: '555-0106',
    email: 'phillip.dawson@example.com',
    address: '987 Health Blvd, Therapy Town',
    profilePicUrl: null,
    medicalHistory: [
      { date: '2024-01-15', type: 'Endocrinology', summary: 'Diabetes check-up. A1C review.', doctor: 'Dr. Clara Dane' },
      { date: '2023-07-01', type: 'Hospital Admission', summary: 'Admitted for acute pancreatitis.', doctor: 'General Hospital' },
    ],
    prescriptions: [
      { date: '2024-01-15', drug: 'Insulin Glargine', dosage: '10 units nightly', status: 'Active' },
      { date: '2024-01-15', drug: 'Empagliflozin 10mg', dosage: '1 daily', status: 'Active' },
    ],
    notes: [
      { date: '2024-01-15', note: 'Patient managing type 2 diabetes. Adjusted insulin dosage. Emphasized diet and regular glucose monitoring.', author: 'Dr. Clara Dane' },
    ],
    vitals: {
      height: '175cm',
      weight: '90kg',
      bp: '130/80 mmHg',
      temperature: '98.6°F',
    },
    currentMedication: ['Insulin Glargine', 'Empagliflozin 10mg', 'Metformin 1000mg (paused)'],
  },
  patient_emma: {
    id: 'patient_emma',
    name: 'Emma Thompson',
    age: 28,
    gender: 'Female',
    bloodType: 'B+',
    contact: '555-0107',
    email: 'emma.thompson@email.com',
    address: '789 Pine St, Manhattan, NY 10002',
    profilePicUrl: null,
    medicalHistory: [
      { date: '2025-06-01', type: 'Follow-up', summary: 'Medication effectiveness review', doctor: 'Dr. Amelia Stone' },
      { date: '2025-05-15', type: 'Initial Consultation', summary: 'Anxiety and sleep issues assessment', doctor: 'Dr. Amelia Stone' },
    ],
    prescriptions: [
      { date: '2025-06-01', drug: 'Sertraline 50mg', dosage: '1 daily', status: 'Active' },
      { date: '2025-06-01', drug: 'Melatonin 3mg', dosage: '1 before bedtime', status: 'Active' },
    ],
    notes: [
      { date: '2025-06-01', note: 'Patient reports improvement in anxiety symptoms. Sleep quality still needs monitoring.', author: 'Dr. Amelia Stone' },
    ],
    vitals: {
      height: '165cm',
      weight: '58kg',
      bp: '115/75 mmHg',
      temperature: '98.6°F',
    },
    currentMedication: ['Sertraline 50mg', 'Melatonin 3mg'],
  },
};

const TabButton = ({ title, onPress, isActive }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]}
    onPress={onPress}
  >
    <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
      {title}
    </Text>
  </TouchableOpacity>
);

const PatientDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { patientId } = route.params;

  const [patient, setPatient] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    console.log('[PatientDetailsScreen] useEffect triggered. patientId:', patientId);
    // Simulate fetching patient data
    const fetchedPatient = mockPatientFullDetails[patientId];
    console.log('[PatientDetailsScreen] mockPatientFullDetails:', JSON.stringify(mockPatientFullDetails, null, 2));
    console.log('[PatientDetailsScreen] fetchedPatient based on patientId (', patientId, '):', JSON.stringify(fetchedPatient, null, 2));
    
    setPatient(fetchedPatient);
    
    // Set navigation title immediately after setting patient data
    if (fetchedPatient) {
      console.log('[PatientDetailsScreen] Setting navigation title to:', fetchedPatient.name);
      navigation.setOptions({ title: fetchedPatient.name });
    }
  }, [patientId]);

  if (!patient) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text>Loading patient details...</Text>
      </SafeAreaView>
    );
  }

  const renderInfoTab = () => (
    <ScrollView contentContainerStyle={styles.tabContentContainer}>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Name:</Text><Text style={styles.infoValue}>{patient.name}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Age:</Text><Text style={styles.infoValue}>{patient.age}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Gender:</Text><Text style={styles.infoValue}>{patient.gender}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Blood Type:</Text><Text style={styles.infoValue}>{patient.bloodType}</Text></View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Phone:</Text><Text style={styles.infoValue}>{patient.contact}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Email:</Text><Text style={styles.infoValue}>{patient.email}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Address:</Text><Text style={styles.infoValue}>{patient.address}</Text></View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Vitals</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Height:</Text><Text style={styles.infoValue}>{patient.vitals.height}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Weight:</Text><Text style={styles.infoValue}>{patient.vitals.weight}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Blood Pressure:</Text><Text style={styles.infoValue}>{patient.vitals.bp}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Temperature:</Text><Text style={styles.infoValue}>{patient.vitals.temperature}</Text></View>
      </View>
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Current Medications</Text>
        {patient.currentMedication.map((med, index) => (
          <Text key={index} style={styles.listItem}>{med}</Text>
        ))}
      </View>
    </ScrollView>
  );

  const renderHistoryTab = () => (
    <ScrollView contentContainerStyle={styles.tabContentContainer}>
      <Text style={styles.sectionTitle}>Medical History</Text>
      {patient.medicalHistory.map((item, index) => (
        <View key={index} style={styles.historyItem}>
          <Text style={styles.historyDate}>{item.date}</Text>
          <Text style={styles.historyType}>{item.type} (with {item.doctor})</Text>
          <Text style={styles.historySummary}>{item.summary}</Text>
        </View>
      ))}
      <Text style={styles.sectionTitle}>Prescription History</Text>
      {patient.prescriptions.map((item, index) => (
        <View key={index} style={styles.historyItem}>
          <Text style={styles.historyDate}>{item.date}</Text>
          <Text style={styles.historyType}>{item.drug} - {item.dosage}</Text>
          <Text style={styles.historySummary}>Status: {item.status}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderNotesTab = () => (
    <ScrollView contentContainerStyle={styles.tabContentContainer}>
      <Text style={styles.sectionTitle}>Doctor's Notes</Text>
      {patient.notes.map((item, index) => (
        <View key={index} style={styles.noteItem}>
          <Text style={styles.noteDate}>{item.date} - by {item.author}</Text>
          <Text style={styles.noteText}>{item.note}</Text>
        </View>
      ))}
      <TouchableOpacity style={styles.actionButtonFull} onPress={() => alert('Add Note')}>
        <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
        <Text style={styles.actionButtonFullText}>Add Note</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarPlaceholderBig}>
          <Ionicons name="person-circle-outline" size={80} color="#7F8C8D" />
        </View>
        {/* Patient Name is now set in navigation options */}
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setActiveTab('info')} style={[styles.tabButton, activeTab === 'info' && styles.activeTabButton]}>
          <Text style={activeTab === 'info' ? styles.activeTabText : styles.tabText}>Info</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('history')} style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}>
          <Text style={activeTab === 'history' ? styles.activeTabText : styles.tabText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('notes')} style={[styles.tabButton, activeTab === 'notes' && styles.activeTabButton]}>
          <Text style={activeTab === 'notes' ? styles.activeTabText : styles.tabText}>Notes</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'info' && renderInfoTab()}
      {activeTab === 'history' && renderHistoryTab()}
      {activeTab === 'notes' && renderNotesTab()}
      
      <View style={styles.bottomActionsContainer}>
        <TouchableOpacity
          style={styles.actionButtonFull}
          onPress={() => navigation.navigate('Prescription', { patient })}
        >
            <Ionicons name="pencil-outline" size={22} color="#FFFFFF" />
            <Text style={styles.actionButtonFullText}>Write Prescription</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatarPlaceholderBig: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  tabContentContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
    marginTop: 10, // spacing between sections
  },
  infoSection: {
    marginBottom: 20,
    backgroundColor:'#FFFFFF',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  infoLabel: {
    fontSize: 15,
    color: '#566573',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: '#2C3E50',
    textAlign: 'right',
    flexShrink: 1, // Allow text to shrink and wrap if needed
  },
  listItem: {
    fontSize: 15,
    color: '#2C3E50',
    paddingVertical: 5,
  },
  historyItem: {
    marginBottom: 10,
  },
  historyDate: {
    fontSize: 14,
    color: '#566573',
  },
  historyType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
  },
  historySummary: {
    fontSize: 15,
    color: '#7F8C8D',
  },
  noteItem: {
    marginBottom: 10,
  },
  noteDate: {
    fontSize: 14,
    color: '#566573',
  },
  noteText: {
    fontSize: 15,
    color: '#7F8C8D',
  },
  bottomActionsContainer: {
      padding: 20,
      borderTopWidth: 1,
      borderTopColor: '#E9ECEF',
      backgroundColor: '#FFFFFF',
  },
  actionButtonFull: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10, // For spacing if multiple buttons or above notes list
  },
  actionButtonFullText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default PatientDetailsScreen; 