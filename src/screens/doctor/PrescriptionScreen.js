import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PrescriptionScreen = ({ route }) => {
  const navigation = useNavigation();
  const { patient } = route.params || {};
  
  const [searchText, setSearchText] = useState('');
  const [selectedMedication, setSelectedMedication] = useState('');
  const [selectedDosage, setSelectedDosage] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState('');
  const [medicationsList, setMedicationsList] = useState([]);

  // Mock data
  const medications = ['Lisinopril', 'Metformin', 'Amoxicillin', 'Ibuprofen', 'Atorvastatin'];
  const dosages = {
    'Lisinopril': ['10mg', '20mg', '40mg'],
    'Metformin': ['500mg', '850mg', '1000mg'],
    'Amoxicillin': ['250mg', '500mg', '875mg'],
    'Ibuprofen': ['200mg', '400mg', '600mg'],
    'Atorvastatin': ['10mg', '20mg', '40mg', '80mg'],
  };
  
  // Medical frequency abbreviations
  const frequencies = [
    { label: 'Once daily (OD)', value: 'OD' },
    { label: 'Twice daily (BD)', value: 'BD' },
    { label: 'Three times daily (TDS)', value: 'TDS' },
    { label: 'Four times daily (QDS)', value: 'QDS' },
    { label: 'As needed (PRN)', value: 'PRN' },
  ];

  // Routes of administration
  const routes = [
    { label: 'By mouth (PO)', value: 'PO' },
    { label: 'Sublingual (SL)', value: 'SL' },
    { label: 'Topical', value: 'TOP' },
    { label: 'Intramuscular (IM)', value: 'IM' },
    { label: 'Intravenous (IV)', value: 'IV' },
    { label: 'Subcutaneous (SC)', value: 'SC' },
  ];

  const pharmacies = [
    { name: 'Pharmacy A', status: 'In Stock' },
    { name: 'Pharmacy B', status: 'Limited Stock' },
    { name: 'Pharmacy C', status: 'Out of Stock' },
  ];

  const filteredMedications = medications.filter(med => 
    med.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddMedication = () => {
    if (!selectedMedication || !selectedDosage || !selectedFrequency || !selectedRoute || !duration) {
      Alert.alert('Error', 'Please fill in all medication fields');
      return;
    }
    const sig = `${selectedDosage} – ${selectedFrequency}`;
    setMedicationsList([...medicationsList, {
      name: selectedMedication,
      dosage: selectedDosage,
      frequency: selectedFrequency,
      route: selectedRoute,
      duration,
      sig,
    }]);
    setSelectedMedication('');
    setSelectedDosage('');
    setSelectedFrequency('');
    setSelectedRoute('');
    setDuration('');
  };

  const handleRemoveMedication = (index) => {
    setMedicationsList(medicationsList.filter((_, i) => i !== index));
  };

  const handlePreviewPrescription = () => {
    if (medicationsList.length === 0) {
      Alert.alert('Error', 'Please add at least one medication');
      return;
    }
    if (!selectedPharmacy) {
      Alert.alert('Error', 'Please select a pharmacy');
      return;
    }
    const prescriptionData = {
      patient,
      date: new Date().toISOString().split('T')[0],
      medications: medicationsList,
      pharmacy: selectedPharmacy,
    };
    navigation.navigate('PrescriptionPreview', { prescriptionData });
  };

  const handleSaveDraft = () => {
    Alert.alert('Success', 'Prescription saved as draft');
  };

  const handleSendPrescription = () => {
    // Compose the prescription object for the queue
    const prescriptionForQueue = {
      patientId: patient.id || 'new',
      patientName: patient.name,
      medication: medicationsList.map(m => `${m.name} ${m.dosage}`).join(', '),
      status: 'Sent',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      medications: medicationsList,
    };
    navigation.navigate('PrescriptionQueue', { newPrescription: prescriptionForQueue });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Prescription</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Info */}
        {patient && (
          <View style={styles.patientInfoCard}>
            <Text style={styles.patientInfoTitle}>Patient Information</Text>
            <Text style={styles.patientName}>{patient.name}</Text>
            {patient.age && <Text style={styles.patientAge}>Age: {patient.age} years</Text>}
          </View>
        )}

        {/* Search Medication */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medication"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Search Results */}
        {searchText.length > 0 && (
          <View style={styles.searchResults}>
            {filteredMedications.map((medication, index) => (
              <TouchableOpacity
                key={index}
                style={styles.medicationOption}
                onPress={() => {
                  setSelectedMedication(medication);
                  setSearchText('');
                }}
              >
                <Text style={styles.medicationText}>{medication}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Selected Medication */}
        {selectedMedication ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SELECTED MEDICATION</Text>
            <View style={styles.selectedMedicationCard}>
              <Text style={styles.selectedMedicationName}>{selectedMedication}</Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setSelectedMedication('')}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Dosage Selection */}
            {dosages[selectedMedication] && (
              <View style={styles.optionSection}>
                <Text style={styles.optionLabel}>DOSAGE</Text>
                <View style={styles.optionButtons}>
                  {dosages[selectedMedication].map((dosage, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        selectedDosage === dosage && styles.selectedOptionButton
                      ]}
                      onPress={() => setSelectedDosage(dosage)}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        selectedDosage === dosage && styles.selectedOptionButtonText
                      ]}>
                        {dosage}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Route of Administration */}
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>ROUTE OF ADMINISTRATION</Text>
              <View style={styles.optionButtons}>
                {routes.map((route, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.routeButton,
                      selectedRoute === route.value && styles.selectedOptionButton
                    ]}
                    onPress={() => setSelectedRoute(route.value)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedRoute === route.value && styles.selectedOptionButtonText
                    ]}>
                      {route.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency Selection */}
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>FREQUENCY</Text>
              <View style={styles.optionButtons}>
                {frequencies.map((frequency, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.frequencyButton,
                      selectedFrequency === frequency.value && styles.selectedOptionButton
                    ]}
                    onPress={() => setSelectedFrequency(frequency.value)}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      selectedFrequency === frequency.value && styles.selectedOptionButtonText
                    ]}>
                      {frequency.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>DURATION</Text>
              <Text style={styles.durationHint}>Use medical notation: 1/52 (1 week), 2/52 (2 weeks), 1/12 (1 month)</Text>
              <TextInput
                style={styles.durationInput}
                placeholder="e.g., 2/52 (2 weeks)"
                value={duration}
                onChangeText={setDuration}
              />
            </View>

            {/* Pharmacy Selection */}
            <View style={styles.optionSection}>
              <Text style={styles.optionLabel}>NEARBY PHARMACIES WITH STOCK</Text>
              {pharmacies.map((pharmacy, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pharmacyOption,
                    selectedPharmacy === pharmacy.name && styles.selectedPharmacy
                  ]}
                  onPress={() => setSelectedPharmacy(pharmacy.name)}
                >
                  <View style={styles.pharmacyInfo}>
                    <View style={[
                      styles.radioButton,
                      selectedPharmacy === pharmacy.name && styles.selectedRadio
                    ]} />
                    <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
                  </View>
                  <Text style={[
                    styles.pharmacyStatus,
                    pharmacy.status === 'In Stock' && styles.inStock,
                    pharmacy.status === 'Limited Stock' && styles.limitedStock,
                    pharmacy.status === 'Out of Stock' && styles.outOfStock,
                  ]}>
                    {pharmacy.status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Search and select a medication to begin</Text>
          </View>
        )}

        {medicationsList.length > 0 && (
          <View style={{marginVertical: 10}}>
            <Text style={{fontWeight: 'bold', marginBottom: 5}}>Medications Added:</Text>
            {medicationsList.map((med, idx) => (
              <View key={idx} style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                <Text style={{flex: 1}}>{med.name} {med.dosage} – {med.sig}</Text>
                <TouchableOpacity onPress={() => handleRemoveMedication(idx)}>
                  <Ionicons name="close-circle" size={20} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.saveDraftButton} onPress={handleSaveDraft}>
          <Text style={styles.saveDraftText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.previewButton, {marginBottom: 10}]} onPress={handleAddMedication}>
          <Text style={styles.previewButtonText}>Add Medication</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.previewButton} onPress={handlePreviewPrescription}>
          <Text style={styles.previewButtonText}>Preview Prescription</Text>
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
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  patientInfoCard: {
    backgroundColor: '#E8F5E8',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  patientInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 5,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#155724',
  },
  patientAge: {
    fontSize: 14,
    color: '#155724',
    marginTop: 2,
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
  searchResults: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#E9ECEF',
    maxHeight: 200,
  },
  medicationOption: {
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  medicationText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#566573',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  selectedMedicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedMedicationName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  changeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  changeButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  optionSection: {
    marginBottom: 25,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#566573',
    marginBottom: 15,
    letterSpacing: 0.5,
  },
  durationHint: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#ffffff',
  },
  frequencyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#ffffff',
    minWidth: '45%',
    marginBottom: 10,
  },
  routeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#ffffff',
    minWidth: '45%',
    marginBottom: 10,
  },
  selectedOptionButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedOptionButtonText: {
    color: '#ffffff',
  },
  durationInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  pharmacyOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  selectedPharmacy: {
    borderColor: '#4A90E2',
    backgroundColor: '#F8FBFF',
  },
  pharmacyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    marginRight: 15,
  },
  selectedRadio: {
    borderColor: '#4A90E2',
    backgroundColor: '#4A90E2',
  },
  pharmacyName: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
  },
  pharmacyStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  inStock: {
    color: '#28A745',
  },
  limitedStock: {
    color: '#FD7E14',
  },
  outOfStock: {
    color: '#DC3545',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 15,
  },
  saveDraftButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveDraftText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  previewButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default PrescriptionScreen; 