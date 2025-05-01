import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ItemTypeIcon = ({ type }) => {
  let iconName = 'medical';
  let color = '#7E3AF2';
  
  switch (type) {
    case 'service':
      iconName = 'calendar';
      color = '#4CAF50';
      break;
    case 'drug':
      iconName = 'medical';
      color = '#7E3AF2';
      break;
    case 'product':
      iconName = 'cube';
      color = '#FF9800';
      break;
    default:
      iconName = 'medical';
  }
  
  return (
    <View style={[styles.itemTypeIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={iconName} size={16} color={color} />
    </View>
  );
};

const PackageDetails = ({ route, navigation }) => {
  const { packageData, institution } = route.params;

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

  const handleAddToCart = () => {
    // Navigate to cart with this package added
    navigation.navigate('Cart', { 
      addedPackage: { 
        ...packageData,
        institution: {
          id: institution.id,
          name: institution.name,
        }
      }
    });
  };

  const handlePayNow = () => {
    // Navigate directly to checkout with this package
    navigation.navigate('Checkout', { 
      items: [{
        ...packageData,
        institution: {
          id: institution.id,
          name: institution.name,
        },
        quantity: 1
      }]
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={packageData.icon || "medical"} 
              size={32} 
              color="#fff" 
            />
          </View>
          
          <Text style={styles.packageName}>{packageData.name}</Text>
          <Text style={styles.institutionName}>{institution.name}</Text>
          <Text style={styles.packageDescription}>
            {packageData.description}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Package Price</Text>
            <Text style={styles.price}>₦{packageData.price.toLocaleString()}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Included Items</Text>
          
          <FlatList
            data={packageData.items}
            keyExtractor={(item) => item.id}
            renderItem={renderPackageItem}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
      
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
          <Text style={styles.payNowText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7E3AF2',
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
    marginBottom: 16,
  },
  packageDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  priceContainer: {
    backgroundColor: '#E8F1FF',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7E3AF2',
  },
  divider: {
    height: 8,
    backgroundColor: '#eeeeee',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  packageItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  addToCartButton: {
    backgroundColor: '#E8F1FF',
    marginRight: 8,
  },
  payNowButton: {
    backgroundColor: '#7E3AF2',
    marginLeft: 8,
  },
  addToCartText: {
    color: '#7E3AF2',
    fontWeight: '500',
    marginLeft: 8,
  },
  payNowText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default PackageDetails; 