import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchInput from '../../components/SearchInput';
import HospitalCard from '../../components/cards/HospitalCard';
import { hospitals, searchHospitals } from '../../data/hospitalData';

const AmbulanceService = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState(hospitals);
  const [loading, setLoading] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching nearby hospitals based on current location
    const timer = setTimeout(() => {
      setNearbyLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setLoading(true);

    // Add slight delay to simulate search
    setTimeout(() => {
      const results = searchHospitals(text);
      setFilteredHospitals(results);
      setLoading(false);
    }, 300);
  };

  const handleHospitalSelect = (hospital) => {
    // Directly trigger phone call when a hospital is selected
    // Actual implementation happens in the HospitalCard component
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Ambulance Services</Text>
      <Text style={styles.subtitle}>
        Find hospitals with ambulance services near you
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No hospitals found</Text>
      <Text style={styles.emptySubtext}>
        Try a different search or check your location settings
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <SearchInput
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search for hospitals..."
      />

      {loading ? (
        <ActivityIndicator size="large" color="#7E3AF2" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HospitalCard
              hospital={item}
              onPress={() => handleHospitalSelect(item)}
            />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
        />
      )}

      {nearbyLoading && (
        <View style={styles.nearbyLoader}>
          <ActivityIndicator size="small" color="#7E3AF2" />
          <Text style={styles.nearbyText}>Locating nearest ambulance services...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyLoader: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    padding: 12,
    margin: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nearbyText: {
    marginLeft: 8,
    color: '#333',
    fontWeight: '500',
  },
});

export default AmbulanceService; 