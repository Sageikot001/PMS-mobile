import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import SearchInput from '../../components/SearchInput';
import { pharmacyData } from '../../data/pharmacyData';
import { orders } from '../../data/orders';
import { useNavigation } from '@react-navigation/native';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const navigation = useNavigation();

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      const results = pharmacyData.drugs.filter(drug =>
        drug.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDrugs(results);
    } else {
      setFilteredDrugs([]);
    }
  };

  const renderDrugItem = ({ item }) => (
    <View style={styles.drugCard}>
      <Text style={styles.drugName}>{item.name}</Text>
      <Text style={styles.drugDescription}>{item.description}</Text>
    </View>
  );

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { order: item })}
    >
      <Text style={styles.orderStatus}>{item.status}</Text>
      <Text style={styles.orderItems}>
        {item.items.map(i => i.name).join(', ')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SearchInput
        value={searchQuery}
        onChangeText={handleSearch}
        placeholder="Search for drugs..."
      />
      <FlatList
        data={filteredDrugs}
        renderItem={renderDrugItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.drugsList}
      />
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drugsList: {
    padding: 16,
  },
  drugCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  drugName: {
    fontSize: 16,
    fontWeight: '600',
  },
  drugDescription: {
    fontSize: 14,
    color: '#666',
  },
  orderCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  orderStatus: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
  },
});

export default Orders; 