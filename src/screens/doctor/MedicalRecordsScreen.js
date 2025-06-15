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

const MedicalRecordsScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('HISTORY');

  // Mock patient data
  const patientInfo = {
    name: 'James Wilson',
    age: '45 YEARS OLD',
    gender: 'Male',
    condition: 'Hypertension',
  };

  // Mock medical records data
  const medicalHistory = [
    {
      id: 1,
      date: 'Feb 14, 2024',
      type: 'Follow-up',
      description: 'Blood pressure check',
      doctor: 'Dr. Smith',
    },
    {
      id: 2,
      date: 'Dec 3, 2023',
      type: 'Consultation',
      description: 'Evaluation of chest pain',
      doctor: 'Dr. Johnson',
    },
    {
      id: 3,
      date: 'Aug 20, 2029',
      type: 'Urgent Care',
      description: 'Acute bronchitis',
      doctor: 'Dr. Williams',
    },
    {
      id: 4,
      date: 'May 5, 2023',
      type: 'Annual Physical',
      description: 'Routine check-up',
      doctor: 'Dr. Smith',
    },
  ];

  const prescriptions = [
    {
      id: 1,
      date: 'Feb 14, 2024',
      medication: 'Lisinopril 10mg',
      dosage: 'Once daily',
      duration: '30 days',
      status: 'Active',
    },
    {
      id: 2,
      date: 'Dec 3, 2023',
      medication: 'Amoxicillin 500mg',
      dosage: 'Three times daily',
      duration: '7 days',
      status: 'Completed',
    },
  ];

  const labResults = [
    {
      id: 1,
      date: 'Feb 14, 2024',
      test: 'Blood Panel',
      result: 'Normal',
      doctor: 'Dr. Smith',
    },
    {
      id: 2,
      date: 'Jan 15, 2024',
      test: 'Cholesterol Test',
      result: 'Elevated',
      doctor: 'Dr. Johnson',
    },
  ];

  const filteredHistory = medicalHistory.filter(record =>
    record.description.toLowerCase().includes(searchText.toLowerCase()) ||
    record.type.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderMedicalHistoryItem = ({ item }) => (
    <TouchableOpacity style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>{item.date}</Text>
        <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
      </View>
      <Text style={styles.recordType}>{item.type}</Text>
      <Text style={styles.recordDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderPrescriptionItem = ({ item }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>{item.date}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'Active' ? styles.activeBadge : styles.completedBadge
        ]}>
          <Text style={[
            styles.statusText,
            item.status === 'Active' ? styles.activeText : styles.completedText
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
      <Text style={styles.recordType}>{item.medication}</Text>
      <Text style={styles.recordDescription}>{item.dosage} • {item.duration}</Text>
    </View>
  );

  const renderLabResultItem = ({ item }) => (
    <TouchableOpacity style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>{item.date}</Text>
        <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
      </View>
      <Text style={styles.recordType}>{item.test}</Text>
      <Text style={styles.recordDescription}>Result: {item.result}</Text>
    </TouchableOpacity>
  );

  const TabButton = ({ title, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'HISTORY':
        return (
          <FlatList
            data={filteredHistory}
            renderItem={renderMedicalHistoryItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'PRESCRIPTIONS':
        return (
          <FlatList
            data={prescriptions}
            renderItem={renderPrescriptionItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      case 'LAB RESULTS':
        return (
          <FlatList
            data={labResults}
            renderItem={renderLabResultItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MEDICAL RECORDS</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* Patient Info */}
      <View style={styles.patientInfoContainer}>
        <View style={styles.patientHeader}>
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{patientInfo.name}</Text>
            <Text style={styles.patientAge}>{patientInfo.age}</Text>
            <Text style={styles.patientCondition}>
              {patientInfo.gender} • {patientInfo.condition}
            </Text>
          </View>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle-outline" size={60} color="#7F8C8D" />
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TabButton
          title="HISTORY"
          isActive={activeTab === 'HISTORY'}
          onPress={() => setActiveTab('HISTORY')}
        />
        <TabButton
          title="PRESCRIPTIONS"
          isActive={activeTab === 'PRESCRIPTIONS'}
          onPress={() => setActiveTab('PRESCRIPTIONS')}
        />
        <TabButton
          title="LAB RESULTS"
          isActive={activeTab === 'LAB RESULTS'}
          onPress={() => setActiveTab('LAB RESULTS')}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Download Button */}
      <View style={styles.downloadContainer}>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadButtonText}>DOWNLOAD RECORDS</Text>
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
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  patientInfoContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  patientAge: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  patientCondition: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  avatarPlaceholder: {
    marginLeft: 15,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#4A90E2',
  },
  tabButtonText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  activeTabButtonText: {
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  recordItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDate: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  recordType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  recordDescription: {
    fontSize: 14,
    color: '#566573',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E8',
  },
  completedBadge: {
    backgroundColor: '#F1F3F5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activeText: {
    color: '#28A745',
  },
  completedText: {
    color: '#7F8C8D',
  },
  downloadContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  downloadButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
});

export default MedicalRecordsScreen; 