import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchResults = ({ results = { pharmacyData: [] }, onPharmacyPress, onDrugPress }) => {
  const { pharmacyData = [] } = results;

  const uniqueId = Date.now();

  const pharmacies = pharmacyData.length > 0 
    ? pharmacyData.filter(item => item.pharmacy).map((item, index) => {
        const pharmacy = item.pharmacy;
        // For chain pharmacies, ensure we have the full location data
        if (pharmacy.isChain && pharmacy.locations) {
          return pharmacy.locations.map((location, locIndex) => ({
            ...pharmacy,
            selectedLocation: location,
            uniqueKey: `pharmacy-${pharmacy.id}-${location.id}-${uniqueId}-${index}-${locIndex}`
          }));
        }
        return [{
          ...pharmacy,
          uniqueKey: `pharmacy-${pharmacy.id}-main-${uniqueId}-${index}`
        }];
      }).flat()
    : [];

  const drugs = pharmacyData.length > 0 
    ? pharmacyData.flatMap((item, pIndex) => 
        (item.drugs || []).map((drug, dIndex) => ({
          ...drug,
          pharmacy: item.pharmacy,
          uniqueKey: `drug-${drug.id}-${item.pharmacy.id}-${item.pharmacy.location?.id || 'main'}-${uniqueId}-${pIndex}-${dIndex}`
        }))
      )
    : [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
      {drugs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Products</Text>
            {drugs.map((drug) => (
              <TouchableOpacity
                key={drug.uniqueKey}
                style={styles.resultItem}
                onPress={() => onDrugPress(drug)}
              >
                <View style={styles.itemContent}>
                  <View style={styles.imageContainer}>
                    <Ionicons name="medical" size={24} color="#666" />
                  </View>
                  <View style={styles.details}>
                    <Text style={styles.name}>{drug.name}</Text>
                    <Text style={styles.brand}>{drug.brand}</Text>
                    <Text style={styles.category}>{drug.category}</Text>
                    <Text style={styles.price}>${drug.price.toFixed(2)}</Text>
                    <Text style={styles.pharmacy}>
                      Available at: {drug.pharmacy.name}
                      {drug.pharmacy.location && ` - ${drug.pharmacy.location}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {pharmacies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pharmacies</Text>
            {pharmacies.map((pharmacy) => (
              <TouchableOpacity
                key={pharmacy.uniqueKey}
                style={styles.resultItem}
                onPress={() => onPharmacyPress(pharmacy)}
              >
                <View style={styles.itemContent}>
                  <View style={styles.imageContainer}>
                    <Ionicons name="business" size={24} color="#666" />
                  </View>
                  <View style={styles.details}>
                    <Text style={styles.name}>{pharmacy.name}</Text>
                    {pharmacy.selectedLocation ? (
                      <>
                        <Text style={styles.location}>{pharmacy.selectedLocation.name}</Text>
                        <Text style={styles.address}>{pharmacy.selectedLocation.address}</Text>
                        <View style={styles.locationDetails}>
                          <Text style={styles.hours}>
                            {pharmacy.selectedLocation.openTime} - {pharmacy.selectedLocation.closeTime}
                          </Text>
                          <Text style={styles.distance}>
                            {pharmacy.selectedLocation.distance}
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={styles.address}>{pharmacy.address}</Text>
                        <View style={styles.locationDetails}>
                          <Text style={styles.hours}>
                            {pharmacy.openTime} - {pharmacy.closeTime}
                          </Text>
                          <Text style={styles.distance}>{pharmacy.distance}</Text>
                        </View>
                      </>
                    )}
                    <Text style={styles.category}>
                      {pharmacy.isChain ? 'Chain Store' : 'Local Pharmacy'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        

        {pharmacies.length === 0 && drugs.length === 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No results found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 8,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContainer: {
    flexGrow: 0,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  brand: {
    fontSize: 14,
    color: '#666',
  },
  category: {
    fontSize: 12,
    color: '#7E3AF2',
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  pharmacy: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noResults: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  locationDetails: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  hours: {
    fontSize: 12,
    color: '#666',
  },
  distance: {
    fontSize: 12,
    color: '#7E3AF2',
  },
});

export default SearchResults; 