import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { pharmacyData, searchPharmaciesAndDrugs } from '../../../data/pharmacyData';

const AddMedication = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchMedications(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchMedications = (query) => {
    setIsLoading(true);
    try {
      const results = searchPharmaciesAndDrugs(query);
      console.log('Search results:', results);
      setSearchResults(results.drugs || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMedicationSelect = (medication) => {
    navigation.navigate('DosageSchedule', { medication });
  };

  const renderMedicationItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.medicationItem}
      onPress={() => handleMedicationSelect(item)}
    >
      <Text style={styles.medicationName}>{item.name}</Text>
      <Text style={styles.medicationDetails}>
        {item.dosageForm} • {item.strength}
      </Text>
      <Text style={styles.medicationDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Add Medication</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search using item name (eg. parace..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderMedicationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
          ListEmptyComponent={() => (
            searchQuery.length > 2 ? (
              <Text style={styles.noResults}>No medications found</Text>
            ) : searchQuery.length > 0 ? (
              <Text style={styles.searchHint}>Type at least 3 characters to search</Text>
            ) : null
          )}
        />
      )}
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
    marginBottom: 16,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    flexGrow: 1,
  },
  medicationItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  medicationDescription: {
    fontSize: 14,
    color: '#666',
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
    fontSize: 16,
  },
  searchHint: {
    textAlign: 'center',
    color: '#666',
    marginTop: 24,
    fontSize: 14,
  },
});

export default AddMedication; 