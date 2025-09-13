import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { HealthDataService, MEDICATION_STATUS } from '../../../lib/api';

const MedicationManagement = () => {
  const navigation = useNavigation();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load medications when component mounts or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadMedications();
    }, [])
  );

  const loadMedications = async () => {
    try {
      setLoading(true);
      const medicationData = await HealthDataService.getMedications();
      setMedications(medicationData || []);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMedications();
    setRefreshing(false);
  };

  const handleAddMedication = () => {
    navigation.navigate('AddMedication');
  };

  const handleMedicationPress = (medication) => {
    Alert.alert(
      medication.name,
      `Dosage: ${medication.dosage}\nFrequency: ${medication.frequency} times daily\nStatus: ${medication.status}\n\nInstructions: ${medication.instructions || 'No special instructions'}`,
      [
        { text: 'Edit', onPress: () => {/* TODO: Navigate to edit */ }},
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const updateMedicationStatus = async (medicationId, newStatus) => {
    try {
      await HealthDataService.updateMedicationStatus(medicationId, newStatus);
      await loadMedications(); // Refresh the list
      Alert.alert('Success', 'Medication status updated successfully!');
    } catch (error) {
      console.error('Error updating medication status:', error);
      Alert.alert('Error', 'Failed to update medication status.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case MEDICATION_STATUS.ACTIVE: return '#4CAF50';
      case MEDICATION_STATUS.COMPLETED: return '#2196F3';
      case MEDICATION_STATUS.PAUSED: return '#FF9800';
      case MEDICATION_STATUS.DISCONTINUED: return '#F44336';
      default: return '#666';
    }
  };

  const renderMedicationItem = (medication) => (
    <TouchableOpacity
      key={medication.id}
      style={styles.medicationCard}
      onPress={() => handleMedicationPress(medication)}
    >
      <View style={styles.medicationHeader}>
        <View style={styles.medicationMainInfo}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          {medication.brand && (
            <Text style={styles.medicationBrand}>({medication.brand})</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(medication.status) }]}>
          <Text style={styles.statusText}>{medication.status}</Text>
        </View>
      </View>
      
      <View style={styles.medicationDetails}>
        <Text style={styles.dosageText}>Dosage: {medication.dosage}</Text>
        <Text style={styles.frequencyText}>
          {medication.frequency} time{medication.frequency > 1 ? 's' : ''} daily
        </Text>
        {medication.dosageTimes && medication.dosageTimes.length > 0 && (
          <Text style={styles.timesText}>
            Times: {medication.dosageTimes.map(time => 
              new Date(time).toLocaleTimeString('en-GB', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            ).join(', ')}
          </Text>
        )}
      </View>

      {medication.startDate && (
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            Started: {formatDate(medication.startDate)}
          </Text>
          {medication.endDate && (
            <Text style={styles.dateText}>
              Until: {formatDate(medication.endDate)}
            </Text>
          )}
        </View>
      )}

      {medication.reminderEnabled && (
        <Text style={styles.reminderText}>🔔 Reminders enabled</Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>💊</Text>
      <Text style={styles.heading}>Manage your medication</Text>
      <Text style={styles.subtitle}>
        You are not managing any medications right now.{'\n'}
        To begin managing your medications, click the "Add medication" button below.
      </Text>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddMedication}
      >
        <Text style={styles.addButtonText}>+ Add medication</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMedicationsList = () => (
    <View style={styles.medicationsListContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.medicationsCount}>
          {medications.length} medication{medications.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity 
          style={styles.addButtonSmall}
          onPress={handleAddMedication}
        >
          <Text style={styles.addButtonSmallText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {medications.map(renderMedicationItem)}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Medication management</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading your medications...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Medication management</Text>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {medications.length === 0 ? renderEmptyState() : renderMedicationsList()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  medicationsListContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicationsCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  addButtonSmall: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  medicationCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationMainInfo: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  medicationBrand: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  medicationDetails: {
    marginBottom: 12,
  },
  dosageText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  frequencyText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  timesText: {
    fontSize: 14,
    color: '#666',
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  reminderText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default MedicationManagement; 