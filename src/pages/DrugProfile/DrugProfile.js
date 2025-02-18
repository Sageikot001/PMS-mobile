import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DrugProfile = ({ route, navigation }) => {
  const { drug } = route.params;

  const handleAddToCart = () => {
    // Implement add to cart functionality
    console.log('Adding to cart:', drug);
  };

  const renderPharmacyInfo = () => {
    const { pharmacy } = drug;
    if (!pharmacy) return null;

    return (
      <TouchableOpacity 
        style={styles.pharmacyLink}
        onPress={() => navigation.navigate('PharmacyDetail', {
          pharmacy: {
            id: pharmacy.id,
            name: pharmacy.name,
            isChain: pharmacy.isChain,
            ...(pharmacy.isChain ? { location: pharmacy.location } : pharmacy)
          }
        })}
      >
        <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
        <Text style={styles.pharmacyLocation}>
          {pharmacy.isChain 
            ? pharmacy.location?.name || pharmacy.location?.address
            : pharmacy.address}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={48} color="#7E3AF2" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{drug.name}</Text>
        <Text style={styles.brand}>{drug.brand}</Text>
        <Text style={styles.category}>Category: {drug.category}</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{drug.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detail}>Dosage: {drug.dosage}</Text>
          <Text style={styles.detail}>Manufacturer: {drug.manufacturer}</Text>
          <Text style={styles.detail}>Batch Number: {drug.batchNumber}</Text>
          <Text style={styles.detail}>Expiry Date: {drug.expiryDate}</Text>
          <Text style={styles.detail}>Storage: {drug.storageInstructions}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available At</Text>
          {renderPharmacyInfo()}
        </View>

        <View style={styles.priceSection}>
          <Text style={styles.price}>${drug.price.toFixed(2)}</Text>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 200,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  brand: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  category: {
    fontSize: 16,
    color: '#7E3AF2',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  detail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  pharmacyLink: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pharmacyLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priceSection: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#7E3AF2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DrugProfile; 