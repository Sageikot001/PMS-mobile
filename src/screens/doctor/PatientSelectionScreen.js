import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PatientSelectionScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [showAddNewPatient, setShowAddNewPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');

  // Mock patient data
  const patients = [
    { id: 1, name: 'Sarah Johnson', age: 45, lastVisit: '2024-01-10' },
    { id: 2, name: 'John Smith', age: 38, lastVisit: '2024-01-08' },
    { id: 3, name: 'Emily Davis', age: 29, lastVisit: '2024-01-05' },
    { id: 4, name: 'Michael Brown', age: 52, lastVisit: '2024-01-03' },
    { id: 5, name: 'Lisa Wilson', age: 41, lastVisit: '2023-12-28' },
    { id: 6, name: 'David Miller', age: 35, lastVisit: '2023-12-25' },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handlePatientSelect = (patient) => {
    navigation.navigate('Prescription', { patient });
  };

  const handleAddNewPatient = () => {
    if (newPatientName.trim()) {
      const newPatient = {
        id: 'new',
        name: newPatientName.trim(),
        age: null,
        lastVisit: new Date().toISOString().split('T')[0],
      };
      navigation.navigate('Prescription', { patient: newPatient });
    }
  };

  const renderPatientItem = ({ item }) => (
    <TouchableOpacity
      style={styles.patientItem}
      onPress={() => handlePatientSelect(item)}
    >
      <View style={styles.patientAvatar}>
        <Ionicons name="person" size={30} color="#7F8C8D" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientDetails}>Age: {item.age} • Last visit: {item.lastVisit}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Patient</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search patients..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Add New Patient Option */}
      <View style={styles.addNewPatientContainer}>
        <TouchableOpacity
          style={styles.addNewPatientButton}
          onPress={() => setShowAddNewPatient(!showAddNewPatient)}
        >
          <Ionicons name="person-add" size={20} color="#4A90E2" />
          <Text style={styles.addNewPatientText}>Add New Patient</Text>
          <Ionicons 
            name={showAddNewPatient ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#4A90E2" 
          />
        </TouchableOpacity>
        
        {showAddNewPatient && (
          <View style={styles.newPatientForm}>
            <TextInput
              style={styles.newPatientInput}
              placeholder="Enter patient name"
              value={newPatientName}
              onChangeText={setNewPatientName}
            />
            <TouchableOpacity
              style={styles.addPatientSubmitButton}
              onPress={handleAddNewPatient}
            >
              <Text style={styles.addPatientSubmitText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Patients List */}
      <View style={styles.patientsSection}>
        <Text style={styles.sectionTitle}>Your Patients</Text>
        <FlatList
          data={filteredPatients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.patientsList}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  addNewPatientContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addNewPatientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  addNewPatientText: {
    flex: 1,
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
    marginLeft: 10,
  },
  newPatientForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
  },
  newPatientInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  addPatientSubmitButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addPatientSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  patientsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  patientsList: {
    paddingBottom: 20,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  patientDetails: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default PatientSelectionScreen; 