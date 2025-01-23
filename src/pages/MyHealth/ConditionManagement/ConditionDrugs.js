import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList,
  Image,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { searchPharmaciesAndDrugs } from '../../../data/pharmacyData';

// Mapping conditions to their corresponding drug categories
const conditionToCategoryMap = {
  'Diabetes': ['Diabetes'],
  'Hypertension': ['Hypertension'],
  'Depression': ['Mental Health'],
  'Anxiety': ['Mental Health'],
  'Pain': ['Pain Relief'],
  'Infection': ['Antibiotics'],
  'First Aid': ['First Aid'],
  // Add more mappings as needed based on your conditions and pharmacy categories
};

const ConditionDrugs = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { condition } = route.params;
  const [recommendedDrugs, setRecommendedDrugs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDrugs = () => {
      setIsLoading(true);
      try {
        // Get the relevant categories for this condition
        const categories = conditionToCategoryMap[condition.name] || [];
        
        // Search for drugs in each relevant category
        let allDrugs = [];
        categories.forEach(category => {
          const results = searchPharmaciesAndDrugs(category);
          if (results.drugs) {
            allDrugs = [...allDrugs, ...results.drugs];
          }
        });

        // Remove duplicates based on drug ID
        const uniqueDrugs = Array.from(new Map(allDrugs.map(drug => [drug.id, drug])).values());
        setRecommendedDrugs(uniqueDrugs);
      } catch (error) {
        console.error('Error fetching drugs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrugs();
  }, [condition]);

  const handleDrugSelect = (drug) => {
    navigation.navigate('DrugProfile', { drug });
  };

  const renderDrugItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.drugCard}
      onPress={() => handleDrugSelect(item)}
    >
      {/* <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.drugImage}
        resizeMode="contain"
        defaultSource={require('../../../../assets/default-drug-image.png')} // Add a default image
      /> */}
      <View style={styles.drugInfo}>
        <Text style={styles.drugName}>{item.name}</Text>
        <Text style={styles.drugBrand}>{item.brand}</Text>
        <Text style={styles.drugDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.drugDetails}>
          <Text style={styles.dosage}>{item.dosage}</Text>
          {item.quantity && (
            <Text style={styles.stock}>
              {item.inStock ? `${item.quantity} in stock` : 'Out of stock'}
            </Text>
          )}
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price}</Text>
          <Text style={styles.pharmacy}>{item.pharmacy.name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Recommended Medications</Text>
      <Text style={styles.subtitle}>
        for {condition.name}
      </Text>

      {recommendedDrugs.length > 0 ? (
        <FlatList
          data={recommendedDrugs}
          renderItem={renderDrugItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.drugsList}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No medications found for this condition
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  drugsList: {
    paddingBottom: 16,
  },
  drugCard: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  drugImage: {
    width: 80,
    height: 80,
    marginRight: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  drugInfo: {
    flex: 1,
  },
  drugName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  drugBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  drugDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  drugDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dosage: {
    fontSize: 14,
    color: '#666',
  },
  stock: {
    fontSize: 14,
    color: '#4CAF50',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  pharmacy: {
    fontSize: 14,
    color: '#666',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ConditionDrugs; 