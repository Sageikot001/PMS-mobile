import { StyleSheet, View, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 cards per row with 16px padding on sides and between

const LocationCard = ({ location, onSelect }) => (
  <TouchableOpacity 
    style={styles.locationCard} 
    onPress={() => onSelect(location)}
  >
    <View style={styles.iconContainer}>
      <Ionicons name="location" size={24} color="#7E3AF2" />
    </View>
    <Text style={styles.locationName} numberOfLines={1}>{location.name}</Text>
    <Text style={styles.locationAddress} numberOfLines={2}>{location.address}</Text>
    <View style={styles.ratingContainer}>
      <Ionicons name="star" size={16} color="#FFD700" />
      <Text style={styles.rating}>{location.rating}</Text>
    </View>
    <View style={styles.locationDetails}>
      <Text style={styles.hours}>
        {location.openTime} - {location.closeTime}
      </Text>
      <Text style={styles.distance}>{location.distance}</Text>
    </View>
  </TouchableOpacity>
);

const LocationModal = ({ visible, pharmacy, onClose, onSelect }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>{pharmacy?.name}</Text>
              <Text style={styles.subtitle}>Select a branch near you</Text>
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.locationsList}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.locationsGrid}>
              {pharmacy?.locations.map((location) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  onSelect={onSelect}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  locationsList: {
    padding: 16,
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 20,
  },
  locationCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  locationDetails: {
    gap: 4,
  },
  hours: {
    fontSize: 12,
    color: '#666',
  },
  distance: {
    fontSize: 12,
    color: '#7E3AF2',
    fontWeight: '500',
  },
});

export default LocationModal; 