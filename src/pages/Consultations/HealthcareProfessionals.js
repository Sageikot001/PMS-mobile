import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { providers } from '../../data/providers';
import HealthcareProviderCard from '../../components/cards/HealthcareProviderCard';
import { userData } from '../../data/dummyUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppointmentService } from '../../lib/api';

const SORT_OPTIONS = [
  { id: 'rating', label: 'Highest Rating' },
  { id: 'experience', label: 'Most Experienced' },
  { id: 'consultations', label: 'Most Consultations' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
];

const HealthcareProfessionals = ({ route, navigation }) => {
  const { type } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState([]);
  const [sortBy, setSortBy] = useState('rating');
  
  // Get unique specialties and institutions from providers
  const specialties = [...new Set(
    type === 'pharmacist' 
      ? providers.pharmacists.flatMap(p => p.specializations)
      : providers.doctors.flatMap(p => p.specializations)
  )];
  
  const institutions = [...new Set(
    type === 'pharmacist'
      ? providers.pharmacists.map(p => p.currentInstitution)
      : providers.doctors.map(p => p.currentInstitution)
  )];

  const filteredProviders = useCallback(() => {
    let providerList = type === 'pharmacist' ? providers.pharmacists : providers.doctors;
    
    // Filter by search query
    if (searchQuery) {
      providerList = providerList.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by specialties
    if (selectedSpecialties.length > 0) {
      providerList = providerList.filter(provider =>
        provider.specializations.some(spec => selectedSpecialties.includes(spec))
      );
    }
    
    // Filter by institutions
    if (selectedInstitutions.length > 0) {
      providerList = providerList.filter(provider =>
        selectedInstitutions.includes(provider.currentInstitution)
      );
    }
    
    // Sort providers
    providerList.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'consultations':
          return b.consultations - a.consultations;
        case 'price-low':
          return a.hourlyRate - b.hourlyRate;
        case 'price-high':
          return b.hourlyRate - a.hourlyRate;
        default:
          return 0;
      }
    });
    
    return providerList;
  }, [type, searchQuery, selectedSpecialties, selectedInstitutions, sortBy]);

  const FiltersModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showFilters}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Sort By</Text>
              {SORT_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.filterOption,
                    sortBy === option.id && styles.selectedFilterOption
                  ]}
                  onPress={() => setSortBy(option.id)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    sortBy === option.id && styles.selectedFilterOptionText
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Specializations</Text>
              <View style={styles.chipContainer}>
                {specialties.map(specialty => (
                  <TouchableOpacity
                    key={specialty}
                    style={[
                      styles.chip,
                      selectedSpecialties.includes(specialty) && styles.selectedChip
                    ]}
                    onPress={() => {
                      setSelectedSpecialties(prev =>
                        prev.includes(specialty)
                          ? prev.filter(s => s !== specialty)
                          : [...prev, specialty]
                      );
                    }}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedSpecialties.includes(specialty) && styles.selectedChipText
                    ]}>
                      {specialty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Institutions</Text>
              <View style={styles.chipContainer}>
                {institutions.map(institution => (
                  <TouchableOpacity
                    key={institution}
                    style={[
                      styles.chip,
                      selectedInstitutions.includes(institution) && styles.selectedChip
                    ]}
                    onPress={() => {
                      setSelectedInstitutions(prev =>
                        prev.includes(institution)
                          ? prev.filter(i => i !== institution)
                          : [...prev, institution]
                      );
                    }}
                  >
                    <Text style={[
                      styles.chipText,
                      selectedInstitutions.includes(institution) && styles.selectedChipText
                    ]}>
                      {institution}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={() => {
                setSelectedSpecialties([]);
                setSelectedInstitutions([]);
                setSortBy('rating');
              }}
            >
              <Text style={styles.resetButtonText}>Reset All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <FiltersModal />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>
          Available {type === 'pharmacist' ? 'Pharmacists' : 'Doctors'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${type === 'pharmacist' ? 'pharmacists' : 'doctors'}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color="#7E3AF2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {filteredProviders().map((provider) => (
          <HealthcareProviderCard
            key={provider.id}
            provider={{ ...provider, type }}
            onPress={() => navigation.navigate('ProfessionalProfile', { provider: { ...provider, type } })}
          />
        ))}
        {filteredProviders().length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No providers found</Text>
            <Text style={styles.noResultsSubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const existingStyles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    gap: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchInput: {
    flex: 1,
    padding: 12,
  },
  filterButton: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  selectedChip: {
    backgroundColor: '#7E3AF2',
  },
  chipText: {
    color: '#666',
  },
  selectedChipText: {
    color: '#fff',
  },
  modalFooter: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7E3AF2',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#7E3AF2',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#7E3AF2',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noResults: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noResultsSubtext: {
    color: '#666',
  },
};

const styles = StyleSheet.create({
  ...existingStyles,
});

export default HealthcareProfessionals; 