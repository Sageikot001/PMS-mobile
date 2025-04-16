import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Image
} from 'react-native';
import SearchInput from '../../components/SearchInput';
import { pharmacyData } from '../../data/pharmacyData';
import { orders } from '../../data/orders';
import { useNavigation } from '@react-navigation/native';

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Running');
  const navigation = useNavigation();

  const statusTypes = ['Running', 'Delivered', 'Canceled'];

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

  const filteredOrders = orders.filter(order => 
    order.status === selectedStatus
  );

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
      <Text style={[
        styles.orderStatus,
        { color: getStatusColor(item.status) }
      ]}>
        {item.status}
      </Text>
      <Text style={styles.orderItems}>
        {item.items.map(i => i.name).join(', ')}
      </Text>
    </TouchableOpacity>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'Running':
        return '#7E3AF2'; // Hot pink
      case 'Delivered':
        return '#4CAF50'; // Green
      case 'Canceled':
        return '#F44336'; // Red
      default:
        return '#000000';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order</Text>

      {/* Status Filter Tabs */}
      <View style={styles.statusContainer}>
        {statusTypes.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusTab,
              selectedStatus === status && styles.statusTabActive,
              { backgroundColor: selectedStatus === status 
                ? getStatusColor(status) 
                : '#F5F5F5' }
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.statusText,
              selectedStatus === status && styles.statusTextActive
            ]}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search Input when needed */}
      {searchQuery.length > 0 && (
        <SearchInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search for drugs..."
        />
      )}

      {/* Orders List or Empty State */}
      {filteredOrders.length > 0 ? (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {/* <Image
            source={require('../../assets/images/no-orders.png')} // Make sure to add this image
            style={styles.emptyImage}
          /> */}
          <Text style={styles.emptyText}>No Order Found</Text>
        </View>
      )}

      {/* Search Results when active */}
      {searchQuery.length > 0 && (
        <FlatList
          data={filteredDrugs}
          renderItem={renderDrugItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.drugsList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 25,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTabActive: {
    backgroundColor: '#7E3AF2',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  statusTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  ordersList: {
    padding: 16,
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
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // Adjust for bottom tabs
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
});

export default Orders; 