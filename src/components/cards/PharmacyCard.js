import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PharmacyCard = ({ pharmacy, onPress }) => {
  const handlePress = () => {
    // Always pass the full pharmacy data, let Home component handle the modal logic
    onPress(pharmacy);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Image 
        source={pharmacy.logo}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.info}>
        <Text style={styles.name}>{pharmacy.name}</Text>
        {pharmacy.isChain ? (
          <Text style={styles.branchCount}>
            {pharmacy.locations.length} branches available
          </Text>
        ) : (
          <Text style={styles.address}>{pharmacy.address}</Text>
        )}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{pharmacy.rating}</Text>
          {pharmacy.isChain && (
            <View style={styles.chainBadge}>
              <Text style={styles.chainText}>Chain Store</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    color: '#666',
  },
  chainBadge: {
    backgroundColor: '#E8F1FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  chainText: {
    color: '#7E3AF2',
    fontSize: 12,
  },
  address: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  branchCount: {
    fontSize: 12,
    color: '#7E3AF2',
    marginBottom: 4,
  },
});

export default PharmacyCard; 