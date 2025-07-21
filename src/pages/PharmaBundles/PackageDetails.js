import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

// Component to render different types of icons based on item type
const ItemTypeIcon = ({ type }) => {
  const getIconName = () => {
    switch (type) {
      case 'drug':
        return 'medical';
      case 'service':
        return 'people';
      case 'product':
      default:
        return 'cube';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'drug':
        return '#4caf50';
      case 'service':
        return '#2196f3';
      case 'product':
      default:
        return '#ff9800';
    }
  };

  return (
    <View style={[styles.typeIcon, { backgroundColor: getIconColor() }]}>
      <Ionicons name={getIconName()} size={20} color="#fff" />
    </View>
  );
};

const PackageDetails = ({ route, navigation }) => {
  const { packageData, institution } = route.params;
  const { addPackageToCart } = useCart();

  const renderPackageItem = ({ item }) => (
    <View style={styles.packageItem}>
      <ItemTypeIcon type={item.type} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemType}>
          {item.type === 'drug' 
            ? `Medication • ${item.quantity} units` 
            : item.type === 'service'
              ? 'Healthcare Service'
              : 'Medical Product'
          }
        </Text>
      </View>
    </View>
  );

  const handleAddToCart = async () => {
    try {
      const success = await addPackageToCart(packageData, institution);
      if (success) {
        Alert.alert(
          'Added to Cart',
          `${packageData.name} has been added to your cart`,
          [
            { text: 'Continue Shopping', style: 'default' },
            { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
          ]
        );
      }
    } catch (error) {
      console.error('Error adding package to cart:', error);
      Alert.alert('Error', 'Failed to add package to cart');
    }
  };

  const handlePayNow = async () => {
    try {
      // Add to cart first
      const success = await addPackageToCart(packageData, institution);
      if (success) {
        // Navigate directly to cart for checkout
        navigation.navigate('Cart');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert('Error', 'Failed to process payment');
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Package Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartButton}>
          <Ionicons name="cart-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Package Info */}
      <View style={styles.packageHeader}>
        <View style={styles.packageIconContainer}>
          <Ionicons name={packageData.icon || 'medical'} size={40} color="#7E3AF2" />
        </View>
        <Text style={styles.packageName}>{packageData.name}</Text>
        <Text style={styles.institutionName}>by {institution.name}</Text>
        <Text style={styles.packageDescription}>{packageData.description}</Text>
      </View>

      {/* Price Section */}
      <View style={styles.priceSection}>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₦{packageData.price.toLocaleString()}</Text>
          <Text style={styles.priceLabel}>Complete Package</Text>
        </View>
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCount}>{packageData.itemCount}</Text>
          <Text style={styles.itemCountLabel}>Items Included</Text>
        </View>
      </View>

      {/* Items List */}
      <View style={styles.itemsSection}>
        <Text style={styles.sectionTitle}>What's Included</Text>
        <FlatList
          data={packageData.items}
          renderItem={renderPackageItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Institution Info */}
      <View style={styles.institutionSection}>
        <Text style={styles.sectionTitle}>About {institution.name}</Text>
        <View style={styles.institutionInfo}>
          <Ionicons name="location" size={20} color="#666" />
          <Text style={styles.institutionLocation}>{institution.location}</Text>
        </View>
        <Text style={styles.institutionPackageCount}>
          {institution.packageCount} packages available
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, styles.addToCartButton]}
          onPress={handleAddToCart}
        >
          <Ionicons name="cart-outline" size={20} color="#7E3AF2" />
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.payNowButton]}
          onPress={handlePayNow}
        >
          <Text style={styles.payNowText}>Buy Now</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cartButton: {
    padding: 8,
  },
  packageHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  packageIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  institutionName: {
    fontSize: 16,
    color: '#7E3AF2',
    fontWeight: '600',
    marginBottom: 12,
  },
  packageDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  priceSection: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 20,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  priceContainer: {
    flex: 1,
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemCountContainer: {
    flex: 1,
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#f0f0f0',
  },
  itemCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  itemCountLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemsSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  packageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#666',
  },
  institutionSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  institutionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  institutionLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  institutionPackageCount: {
    fontSize: 12,
    color: '#888',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 8,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addToCartButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#7E3AF2',
  },
  addToCartText: {
    color: '#7E3AF2',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  payNowButton: {
    backgroundColor: '#007bff',
  },
  payNowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PackageDetails; 