import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// You'll need to create this data file
import { pharmacyInventory } from '../../data/pharmacyInventory';

const PharmacyDetail = ({ route, navigation }) => {
  const { pharmacy, selectedDrug, initialView, category: initialCategory, categoryDrugs } = route.params;
  const [viewMode, setViewMode] = useState(initialView || 'inventory');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '');
  const [searchQuery, setSearchQuery] = useState('');

  const getInventory = () => {
    // Add null checks and default values
    if (!pharmacy) return {};
    
    if (pharmacy.isChain) {
      return pharmacy.location?.inventory?.categories || {};
    }
    return pharmacy.inventory?.categories || {};
  };

  const filteredInventory = () => {
    const inventory = getInventory();
    
    if (viewMode === 'inventory') {
      if (searchQuery) {
        const searchTerm = searchQuery.toLowerCase();
        return Object.entries(inventory).flatMap(([category, drugs]) =>
          (drugs || []).filter(drug =>
            drug.name.toLowerCase().includes(searchTerm) ||
            drug.brand?.toLowerCase().includes(searchTerm) ||
            drug.description?.toLowerCase().includes(searchTerm)
          )
        );
      }
      return Object.values(inventory).flat().filter(Boolean);
    } else {
      if (selectedCategory) {
        const categoryDrugs = inventory[selectedCategory] || [];
        if (selectedDrug) {
          return [
            selectedDrug,
            ...categoryDrugs.filter(drug => drug.id !== selectedDrug.id)
          ];
        }
        return categoryDrugs;
      }
      return [];
    }
  };

  const renderInventoryView = () => {
    if (selectedDrug) {
      // Get the category drugs from the pharmacy's inventory
      const pharmacyInventory = pharmacy.isChain 
        ? pharmacy.location.inventory.categories[category]
        : pharmacy.inventory.categories[category];

      // Put selected drug first, then the rest of the category
      const sortedDrugs = [
        selectedDrug,
        ...pharmacyInventory.filter(drug => drug.id !== selectedDrug.id)
      ];

      return (
        <View>
          <Text style={styles.categoryTitle}>{category}</Text>
          <FlatList
            data={sortedDrugs}
            renderItem={({ item }) => renderDrugItem(item, item.id === selectedDrug.id)}
            keyExtractor={item => item.id}
          />
        </View>
      );
    } else {
      // Get the correct inventory based on pharmacy type
      const inventory = pharmacy.isChain 
        ? pharmacy.location.inventory.categories
        : pharmacy.inventory.categories;

      return (
        <FlatList
          data={Object.entries(inventory)}
          renderItem={({ item: [category, drugs] }) => (
            <View>
              <Text style={styles.categoryTitle}>{category}</Text>
              {drugs.map(drug => renderDrugItem(drug))}
            </View>
          )}
          keyExtractor={([category]) => category}
        />
      );
    }
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
          {pharmacy.location ? pharmacy.location.name : pharmacy.name}
        </Text>
        <Text style={styles.pharmacyAddress}>
          {pharmacy.location ? pharmacy.location.address : pharmacy.address}
        </Text>
      </View>
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
          {pharmacyInventory.categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.selectedCategoryChip
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.selectedCategoryChipText
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.productImagePlaceholder} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

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
});

export default PharmacyDetail; 