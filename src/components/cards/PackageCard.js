import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PackageCard = ({ packageData, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name={packageData.icon || "medical"} size={28} color="#fff" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{packageData.name}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {packageData.description}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.price}>₦{packageData.price.toLocaleString()}</Text>
          <View style={styles.itemCount}>
            <Ionicons name="list-outline" size={14} color="#7E3AF2" />
            <Text style={styles.countText}>{packageData.itemCount} items</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7E3AF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7E3AF2',
  },
  itemCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
});

export default PackageCard; 