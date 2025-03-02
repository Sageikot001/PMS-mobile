import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PharmacyDetail = ({ route, navigation }) => {
  const { pharmacy, selectedDrug, initialView } = route.params;
  const [viewMode, setViewMode] = useState(initialView || 'inventory');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Get inventory based on pharmacy type (chain or local)
  const getInventory = () => {
    if (!pharmacy) return {};
    
    if (pharmacy.isChain && pharmacy.location) {
      return pharmacy.location.inventory.categories;
    }
    return pharmacy.inventory.categories;
  };

  // Filter inventory based on search or category selection
  const filteredInventory = () => {
    const inventory = getInventory();
    
    if (viewMode === 'inventory' && searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
      const results = [];
      
      Object.entries(inventory).forEach(([category, drugs]) => {
        drugs.forEach(drug => {
          if (
            drug.name.toLowerCase().includes(searchTerm) ||
            drug.brand.toLowerCase().includes(searchTerm) ||
            drug.description.toLowerCase().includes(searchTerm)
          ) {
            results.push({ ...drug, category });
          }
        });
      });
      
      return results;
    }
    
    if (viewMode === 'category' && selectedCategory) {
      return inventory[selectedCategory]?.map(drug => ({ ...drug, category: selectedCategory })) || [];
    }
    
    // Show all products if no search or category filter
    return Object.entries(inventory).flatMap(([category, drugs]) =>
      drugs.map(drug => ({ ...drug, category }))
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.pharmacyInfo}>
        <Text style={styles.pharmacyName}>
          {pharmacy.isChain && pharmacy.location 
            ? pharmacy.location.name 
            : pharmacy.name}
        </Text>
        <Text style={styles.pharmacyAddress}>
          {pharmacy.isChain && pharmacy.location 
            ? pharmacy.location.address 
            : pharmacy.address}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.profileButton}
        onPress={() => navigation.navigate('PharmacyProfile', { 
          pharmacy: {
            ...pharmacy,
            // Ensure we pass the full locations array for chain pharmacies
            ...(pharmacy.isChain && { locations: pharmacy.locations })
          }
        })}
      >
        <Ionicons name="information-circle-outline" size={24} color="#7E3AF2" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchSection}>
      <View style={styles.searchModeToggle}>
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            viewMode === 'inventory' && styles.activeToggle
          ]}
          onPress={() => setViewMode('inventory')}
        >
          <Text style={viewMode === 'inventory' ? styles.activeToggleText : styles.toggleText}>
            Search Inventory
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.toggleButton,
            viewMode === 'category' && styles.activeToggle
          ]}
          onPress={() => setViewMode('category')}
        >
          <Text style={viewMode === 'category' ? styles.activeToggleText : styles.toggleText}>
            By Category
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'inventory' ? (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {Object.keys(getInventory()).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.selectedCategoryChip
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === category && styles.selectedCategoryChipText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderProductItem = ({ item }) => {
    const drugData = {
      ...item,
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        isChain: pharmacy.isChain,
        location: pharmacy.isChain 
          ? {
              id: pharmacy.location.id,
              name: pharmacy.location.name,
              address: pharmacy.location.address
            }
          : {
              id: pharmacy.id,
              name: pharmacy.name,
              address: pharmacy.address
            }
      }
    };

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('DrugProfile', { drug: drugData })}
      >
        <View style={styles.productImagePlaceholder}>
          <Ionicons name="medical" size={24} color="#666" />
        </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productBrand}>{item.brand}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      <FlatList
        data={filteredInventory()}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productsList}
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
  pharmacyInfo: {
    marginLeft: 16,
  },
  pharmacyName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pharmacyAddress: {
    color: '#666',
    fontSize: 14,
  },
  searchSection: {
    padding: 16,
  },
  searchModeToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    color: '#666',
  },
  activeToggleText: {
    color: '#7E3AF2',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesScroll: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: '#7E3AF2',
  },
  categoryChipText: {
    color: '#666',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
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
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#7E3AF2',
    marginTop: 4,
  },
  productDescription: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7E3AF2',
  },
  profileButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
  },
});

export default PharmacyDetail; 