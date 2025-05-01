import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchInput from '../../components/SearchInput';
import HealthcareInstitutionCard from '../../components/cards/HealthcareInstitutionCard';
import { healthcareInstitutions, searchHealthcareInstitutions } from '../../data/healthcareInstitutions';

const PharmaBundles = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInstitutions, setFilteredInstitutions] = useState(healthcareInstitutions);
  const [loading, setLoading] = useState(false);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setLoading(true);
    
    // Add slight delay to simulate search
    setTimeout(() => {
      const results = searchHealthcareInstitutions(text);
      setFilteredInstitutions(results);
      setLoading(false);
    }, 300);
  };

  const handleInstitutionPress = (institution) => {
    navigation.navigate('InstitutionPackages', { institution });
  };

  const renderInstitutionItem = ({ item }) => (
    <HealthcareInstitutionCard 
      institution={item}
      onPress={() => handleInstitutionPress(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="medical-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No healthcare providers found</Text>
      <Text style={styles.emptySubtext}>
        Try a different search term or check back later
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

      <View style={styles.header}>
        <Text style={styles.title}>Pharma Bundles</Text>
        <Text style={styles.subtitle}>
          Find healthcare packages from top institutions
        </Text>
      </View>

      <SearchInput
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search for healthcare providers..."
      />

      {loading ? (
        <ActivityIndicator size="large" color="#7E3AF2" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredInstitutions}
          keyExtractor={(item) => item.id}
          renderItem={renderInstitutionItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
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
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
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
});

export default PharmaBundles; 