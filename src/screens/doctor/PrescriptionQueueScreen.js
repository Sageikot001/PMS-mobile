import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const PrescriptionQueueScreen = ({ route }) => {
  const navigation = useNavigation();

  // Mock data for prescription queue
  const [prescriptions, setPrescriptions] = useState([
    {
      id: 1,
      patientId: 'p1',
      patientName: 'Sarah Johnson',
      medication: 'Lisinopril 10mg',
      status: 'Pending',
      date: '2024-01-15',
      time: '10:30 AM',
    },
    {
      id: 2,
      patientId: 'p2',
      patientName: 'John Smith',
      medication: 'Metformin 500mg',
      status: 'Sent',
      date: '2024-01-15',
      time: '09:15 AM',
    },
    {
      id: 3,
      patientId: 'p3',
      patientName: 'Emily Davis',
      medication: 'Amoxicillin 875mg',
      status: 'Pending',
      date: '2024-01-14',
      time: '04:45 PM',
    },
  ]);

  // Add new prescription from navigation params (if any)
  useFocusEffect(
    React.useCallback(() => {
      if (route.params && route.params.newPrescription) {
        setPrescriptions(prev => [
          { ...route.params.newPrescription, id: Date.now() },
          ...prev
        ]);
        // Clear param so it doesn't add again
        navigation.setParams({ newPrescription: undefined });
      }
    }, [route.params])
  );

  const handlePrescriptionPress = (item) => {
    navigation.navigate('PatientDetails', {
      patientId: item.patientId,
      prescriptionId: item.id,
      patientName: item.patientName,
    });
  };

  const renderPrescriptionItem = ({ item }) => (
    <TouchableOpacity style={styles.prescriptionItem} onPress={() => handlePrescriptionPress(item)}>
      <View style={styles.prescriptionContent}>
        <View style={styles.prescriptionHeader}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'Sent' ? styles.sentBadge : styles.pendingBadge
          ]}>
            <Text style={[
              styles.statusText,
              item.status === 'Sent' ? styles.sentText : styles.pendingText
            ]}>
              {item.status}
            </Text>
          </View>
        </View>
        <Text style={styles.medicationName}>{item.medication}</Text>
        <Text style={styles.prescriptionDate}>{item.date} • {item.time}</Text>
      </View>
      <View style={styles.prescriptionActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="download-outline" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescription Queue</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {prescriptions.length > 0 ? (
          <FlatList
            data={prescriptions}
            renderItem={renderPrescriptionItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="prescription" size={80} color="#E9ECEF" />
            <Text style={styles.emptyStateTitle}>No Prescriptions Yet</Text>
            <Text style={styles.emptyStateText}>Start by adding your first prescription</Text>
          </View>
        )}
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => navigation.navigate('PatientSelection')}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100, // Space for floating button
  },
  prescriptionItem: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prescriptionContent: {
    flex: 1,
  },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#FFF3CD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sentText: {
    color: '#28A745',
  },
  pendingText: {
    color: '#856404',
  },
  medicationName: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 5,
  },
  prescriptionDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  prescriptionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default PrescriptionQueueScreen; 