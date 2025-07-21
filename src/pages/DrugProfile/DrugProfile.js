import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

const DrugProfile = ({ route, navigation }) => {
  const { drug } = route.params;
  const { addDrugToCart } = useCart();

  const handleAddToCart = async () => {
    try {
      const success = await addDrugToCart(drug);
      if (success) {
        Alert.alert(
          'Added to Cart',
          `${drug.name} has been added to your cart`,
          [
            { text: 'Continue Shopping', style: 'default' },
            { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
          ]
        );
      }
    } catch (error) {
      console.error('Error adding drug to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
    }
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.drugHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={48} color="#7E3AF2" />
        </View>
        <Text style={styles.name}>{drug.name}</Text>
        <Text style={styles.brand}>{drug.brand}</Text>
        <Text style={styles.category}>Category: {drug.category}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{drug.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Dosage:</Text>
            <Text style={styles.detailValue}>{drug.dosage}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Manufacturer:</Text>
            <Text style={styles.detailValue}>{drug.manufacturer}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Batch Number:</Text>
            <Text style={styles.detailValue}>{drug.batchNumber}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expiry Date:</Text>
            <Text style={styles.detailValue}>{drug.expiryDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Storage:</Text>
            <Text style={styles.detailValue}>{drug.storageInstructions}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available At</Text>
          {renderPharmacyInfo()}
        </View>

        <View style={styles.priceSection}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₦{drug.price.toFixed(2)}</Text>
            <Text style={styles.priceLabel}>Per unit</Text>
          </View>
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Ionicons name="cart" size={20} color="#fff" style={styles.buttonIcon} />
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  cartButton: {
    padding: 8,
  },
  drugHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 16,
    color: '#7E3AF2',
    fontWeight: '600',
    marginBottom: 8,
  },
  category: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  pharmacyLink: {
    backgroundColor: '#f8f9ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7E3AF2',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pharmacyLocation: {
    fontSize: 14,
    color: '#666',
  },
  priceSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007bff',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DrugProfile; 