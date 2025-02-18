import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { drugCategories } from '../../data/drugCategories';
import SearchInput from '../../components/SearchInput';

const CategoryDetails = ({ route, navigation }) => {
  const { category } = route.params;
  const categoryData = drugCategories[category.id];
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const renderDrugItem = ({ item }) => (
    <TouchableOpacity
      style={styles.drugCard}
      onPress={() => navigation.navigate('DrugProfile', { drug: item })}
    >
      <View style={styles.drugInfo}>
        <Text style={styles.drugName}>{item.name}</Text>
        <Text style={styles.drugDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.drugPrice}>${item.price.toFixed(2)}</Text>
        <Text style={styles.pharmacyName}>
          Available at: {item.pharmacy.name}
          {item.pharmacy.isChain && item.pharmacy.location 
            ? ` - ${item.pharmacy.location.name}`
            : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{category.title}</Text>
      </View>

      <SearchInput
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search for drugs in this category..."
      />

      <FlatList
        data={categoryData.drugs}
        renderItem={renderDrugItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.drugsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  drugsList: {
    padding: 16,
  },
  drugCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  drugInfo: {
    flex: 1,
  },
  drugName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  drugDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  drugPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7E3AF2',
    marginBottom: 4,
  },
  pharmacyName: {
    fontSize: 12,
    color: '#666',
  },
});

export default CategoryDetails; 