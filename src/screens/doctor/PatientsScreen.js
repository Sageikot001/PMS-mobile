import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Mock data for patients - replace with actual data fetching later
const mockPatientsData = {
  all: [
    { id: 'p1', name: 'Judith Scoft', age: 46, lastVisit: 'Feb 12, 2024', condition: 'Hypertension' },
    { id: 'p2', name: 'Samuel Cole', age: 54, lastVisit: 'Feb 16, 2024', condition: 'Back pain' },
    { id: 'p3', name: 'Rose Nguyen', age: 73, lastVisit: 'Feb 26, 2024', condition: 'Follow-up for labs' },
    { id: 'p4', name: 'Eugene Porter', age: 30, lastVisit: 'Jan 25, 2024', condition: 'New medication' },
    { id: 'p5', name: 'Martha Hayes', age: 67, lastVisit: 'Feb 20, 2024', condition: 'Knee pain' },
    { id: 'p6', name: 'Phillip Dawson', age: 51, lastVisit: 'Jan 15, 2024', condition: 'Diabetes check-up' },
  ],
  recent: [
    { id: 'p1', name: 'Judith Scoft', age: 46, lastVisit: 'Feb 12, 2024', condition: 'Hypertension' },
    { id: 'p3', name: 'Rose Nguyen', age: 73, lastVisit: 'Feb 26, 2024', condition: 'Follow-up for labs' },
  ],
  favorites: [
    { id: 'p2', name: 'Samuel Cole', age: 54, lastVisit: 'Feb 16, 2024', condition: 'Back pain' },
  ],
};

const DoctorPatientsScreen = () => {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'recent', 'favorites'

  const filteredPatients = mockPatientsData[activeFilter].filter(patient =>
    patient.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderPatientCard = ({ item }) => (
    <View style={styles.patientCard}>
      <View style={styles.avatarPlaceholder}>
        <Ionicons name="person-outline" size={30} color="#7F8C8D" />
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientDetails}>
          {item.age} yrs • Last visit: {item.lastVisit} • {item.condition}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.viewButton} 
        onPress={() => navigation.navigate('PatientDetails', { patientId: item.id, patientName: item.name })}
      >
        <Text style={styles.viewButtonText}>View</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFilterTab = (filterKey, filterName) => (
    <TouchableOpacity
      style={[styles.filterTab, activeFilter === filterKey && styles.activeFilterTab]}
      onPress={() => setActiveFilter(filterKey)}
    >
      <Text style={[styles.filterTabText, activeFilter === filterKey && styles.activeFilterTabText]}>
        {filterName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Patients</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#7F8C8D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search patients..."
            placeholderTextColor="#7F8C8D"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {renderFilterTab('all', 'All')}
        {renderFilterTab('recent', 'Recent')}
        {renderFilterTab('favorites', 'Favorites')}
      </View>

      {/* Patient List */}
      <FlatList
        data={filteredPatients}
        renderItem={renderPatientCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>No patients found.</Text>
          </View>
        )}
      />

      {/* Add Patient FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => alert('Add New Patient')}>
        <Ionicons name="add-outline" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  // Header
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F5',
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#2C3E50',
  },
  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeFilterTab: {
    backgroundColor: '#4A90E2',
  },
  filterTabText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  // Patient List
  listContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 80, // To avoid FAB overlap
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  patientDetails: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 3,
  },
  viewButton: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewButtonText: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyListText: {
    fontSize: 16,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default DoctorPatientsScreen; 