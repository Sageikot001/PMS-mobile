import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TextInput, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryCard from '../../components/cards/CategoryCard';
import ServiceCard from '../../components/cards/ServiceCard';
import ConsultationCard from '../../components/cards/ConsultationCard';
import BlogCard from '../../components/cards/BlogCard';
import { drugs } from '../../data/drugs';
import SearchResults from '../../components/search/SearchResults';
import PharmacyCard from '../../components/cards/PharmacyCard';
import LocationModal from '../../components/modals/LocationModal';
import { pharmacyData } from '../../data/pharmacyData';
import { FlashList } from '@shopify/flash-list';
import { searchPharmaciesAndDrugs } from '../../data/pharmacyData';
import SearchInput from '../../components/SearchInput';

const CATEGORIES = [
  {
    id: '1',
    title: 'Hypertension',
    icon: '🫀',
    backgroundColor: '#E8F1FF',
  },
  {
    id: '2',
    title: 'Sexual Health',
    icon: '❤️',
    backgroundColor: '#FFE8F1',
  },
  {
    id: '3',
    title: 'Pregnancy & conception',
    icon: '🤰',
    backgroundColor: '#E8FFF1',
  },
];

const SERVICES = [
  {
    id: '1',
    title: 'Medication refill',
    icon: 'medical',
  },
  {
    id: '2',
    title: 'Pharma bundles',
    icon: 'cart',
  },
  {
    id: '3',
    title: 'Chat with Tinai',
    icon: 'chatbubbles',
  },
];

const Home = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ pharmacyData: [] });
  const [showResults, setShowResults] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const nearbyPharmacies = pharmacyData.pharmacies.map(pharmacy => {
    if (pharmacy.isChain) {
      const mainLocation = pharmacy.locations[0];
      return {
        ...pharmacy,
        selectedLocation: mainLocation,
        address: mainLocation.address,
        distance: mainLocation.distance,
        rating: mainLocation.rating,
        openTime: mainLocation.openTime,
        closeTime: mainLocation.closeTime,
        locations: pharmacy.locations
      };
    }
    return pharmacy;
  });

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (text.trim().length > 0) {
      setShowResults(true);
      const results = searchPharmaciesAndDrugs(text);
      setSearchResults({
        pharmacyData: [
          ...results.pharmacies.map(pharmacy => ({
            pharmacy,
            drugs: []
          })),
          ...results.drugs.map(drug => ({
            pharmacy: drug.pharmacy,
            drugs: [drug]
          }))
        ]
      });
    } else {
      setShowResults(false);
      setSearchResults({ pharmacyData: [] });
    }
  };

  const handlePharmacyPress = (pharmacy) => {
    const fullPharmacyData = pharmacyData.pharmacies.find(p => p.id === pharmacy.id);
    
    if (!fullPharmacyData) {
      console.warn('Pharmacy not found:', pharmacy.id);
      return;
    }

    if (pharmacy.isChain) {
      setSelectedPharmacy(fullPharmacyData);
      setLocationModalVisible(true);
    } else {
      navigation.navigate('PharmacyDetail', {
        pharmacy: fullPharmacyData
      });
    }
    setShowResults(false);
  };

  const handleDrugPress = (drug) => {
    navigation.navigate('DrugProfile', { drug });
  };

  const handleLocationSelect = (location) => {
    setLocationModalVisible(false);
    navigation.navigate('PharmacyDetail', {
      pharmacy: {
        ...selectedPharmacy,
        location,
        locations: selectedPharmacy.locations
      }
    });
  };

  const renderSections = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.location}
          onPress={() => navigation.navigate('AddressManagement')}>
          <Ionicons name="location" size={24} color="#444" />
          <Text style={styles.locationText}>10, Ugbeje Aki Stree...</Text>
          <Ionicons name="chevron-down" size={24} color="#444" />
        </TouchableOpacity>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color="#444" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color="#444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchInput
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search for medicines..."
        />
      </View>

      {showResults && (
        <SearchResults 
          results={searchResults}
          onPharmacyPress={handlePharmacyPress}
          onDrugPress={handleDrugPress}
        />
      )}

      {!showResults && (
        <>
          <View style={styles.banner}>
            {/* Banner content */}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.pharmaciesScroll}
            >
              {nearbyPharmacies.map((pharmacy) => (
                <PharmacyCard
                  key={pharmacy.id}
                  pharmacy={pharmacy}
                  onPress={() => handlePharmacyPress(pharmacy)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Shop by categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text style={styles.viewAll}>View all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {CATEGORIES.map((category) => (
                <CategoryCard
                  key={category.id}
                  title={category.title}
                  icon={category.icon}
                  backgroundColor={category.backgroundColor}
                  onPress={() => navigation.navigate('CategoryDetails', { category })}
                  style={styles.homeCategoryCard}
                  width={120}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Explore our services</Text>
            <View style={styles.servicesGrid}>
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.id}
                  title={service.title}
                  icon={service.icon}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <ConsultationCard />
          </View>

          <View style={styles.section}>
            <BlogCard />
          </View>
        </>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      <FlashList
        data={[{ key: 'content' }]}
        renderItem={() => renderSections()}
        estimatedItemSize={200}
      />

      <LocationModal
        visible={locationModalVisible}
        pharmacy={selectedPharmacy}
        onClose={() => setLocationModalVisible(false)}
        onSelect={handleLocationSelect}
      />
    </View>
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
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  banner: {
    margin: 16,
    height: 150,
    backgroundColor: '#7E3AF2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    color: '#7E3AF2',
    fontWeight: '500',
  },
  categoriesScroll: {
    // paddingVertical: 8,
    flexDirection: 'row',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  bottomPadding: {
    height: 20,
  },
  pharmaciesScroll: {
    marginTop: 16,
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 120, // Adjust based on your header height
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.98)',
    zIndex: 1000,
  },
  homeCategoryCard: {
    marginRight: 12,
    width: 120,
    aspectRatio: 1,
  },
});

export default Home; 