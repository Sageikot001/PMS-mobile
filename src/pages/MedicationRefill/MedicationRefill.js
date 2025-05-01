import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SearchInput from '../../components/SearchInput';
import { drugs } from '../../data/drugs';

const MedicationRefill = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (text) => {
    setSearchQuery(text);
    setLoading(true);
    
    // Add slight delay to simulate search
    setTimeout(() => {
      if (text.trim() === '') {
        setFilteredDrugs([]);
        setShowResults(false);
      } else {
        // Filter drugs based on search query
        const results = drugs.filter(drug => 
          drug.name.toLowerCase().includes(text.toLowerCase()) ||
          (drug.generic && drug.generic.toLowerCase().includes(text.toLowerCase()))
        );
        setFilteredDrugs(results);
        setShowResults(true);
      }
      setLoading(false);
    }, 300);
  };

  const handleDrugPress = (drug) => {
    navigation.navigate('DrugProfile', { drug });
  };

  const renderDrugItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.drugCard}
      onPress={() => handleDrugPress(item)}
    >
      <View style={styles.drugInfo}>
        <Text style={styles.drugName}>{item.name}</Text>
        {item.generic && <Text style={styles.genericName}>{item.generic}</Text>}
        <Text style={styles.dosage}>{item.dosage}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₦{item.price.toLocaleString()}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {
          // Navigation to cart with this drug added
          navigation.navigate('Cart', { addedDrug: item });
        }}
      >
        <Ionicons name="cart" size={20} color="#fff" />
        <Text style={styles.addButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyResults = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="medical-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>No medications found</Text>
      <Text style={styles.emptySubtext}>
        Try a different search term or check our catalog
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
        <Text style={styles.title}>Medication Refill</Text>
        <Text style={styles.subtitle}>
          Search and order your prescription medications
        </Text>
      </View>

      <SearchInput
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search for medications..."
      />

      {loading ? (
        <ActivityIndicator size="large" color="#7E3AF2" style={styles.loader} />
      ) : showResults ? (
        <FlatList
          data={filteredDrugs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDrugItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyResults}
        />
      ) : (
        <View style={styles.initialState}>
          <Ionicons name="medical" size={80} color="#7E3AF2" style={styles.icon} />
          <Text style={styles.initialText}>Search for your medications</Text>
          <Text style={styles.initialSubtext}>
            Find and add medications to your cart for refill
          </Text>
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
  drugCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drugInfo: {
    marginBottom: 12,
  },
  drugName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  genericName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  priceContainer: {
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7E3AF2',
  },
  addButton: {
    backgroundColor: '#7E3AF2',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
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
  initialState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  initialText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  initialSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default MedicationRefill; 