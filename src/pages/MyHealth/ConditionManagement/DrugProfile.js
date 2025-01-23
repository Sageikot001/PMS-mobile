import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image,
  ScrollView 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const DrugProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { drug } = route.params;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <ScrollView>
        <Image 
          source={{ uri: drug.imageUrl }} 
          style={styles.drugImage}
          resizeMode="contain"
        />

        <View style={styles.infoContainer}>
          <Text style={styles.drugName}>{drug.name}</Text>
          <Text style={styles.drugBrand}>{drug.brand}</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.label}>Bar Number:</Text>
            <Text style={styles.value}>{drug.barNumber}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Expiry Date:</Text>
            <Text style={styles.value}>{drug.expiryDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Manufacturer:</Text>
            <Text style={styles.value}>{drug.manufacturer}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Storage:</Text>
            <Text style={styles.value}>{drug.storage}</Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{drug.description}</Text>

          <Text style={styles.sectionTitle}>Usage Instructions</Text>
          <Text style={styles.description}>{drug.instructions}</Text>

          <Text style={styles.sectionTitle}>Side Effects</Text>
          <Text style={styles.description}>{drug.sideEffects}</Text>

          <View style={styles.pharmacyContainer}>
            <View>
              <Text style={styles.pharmacyName}>{drug.pharmacy.name}</Text>
              <Text style={styles.pharmacyAddress}>{drug.pharmacy.address}</Text>
            </View>
            <Text style={styles.price}>${drug.price}</Text>
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              // Handle adding to cart or prescription
            }}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  drugImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  infoContainer: {
    padding: 16,
  },
  drugName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  drugBrand: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  label: {
    width: 120,
    fontSize: 16,
    color: '#666',
  },
  value: {
    flex: 1,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  pharmacyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pharmacyAddress: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  addButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DrugProfile; 