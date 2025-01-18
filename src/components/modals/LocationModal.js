import { StyleSheet, View, Text, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LocationCard = ({ location, onSelect }) => (
  <TouchableOpacity style={styles.locationCard} onPress={() => onSelect(location)}>
    <View>
      <Text style={styles.locationName}>{location.name}</Text>
      <Text style={styles.address}>{location.address}</Text>
      <View style={styles.details}>
        <Text style={styles.time}>{location.openTime} - {location.closeTime}</Text>
        <Text style={styles.distance}>{location.distance}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#666" />
  </TouchableOpacity>
);

const LocationModal = ({ visible, pharmacy, onClose, onSelectLocation }) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Location</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={pharmacy?.locations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <LocationCard
                location={item}
                onSelect={(location) => {
                  onSelectLocation(location);
                  onClose();
                }}
              />
            )}
          />
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
    paddingTop: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  address: {
    color: '#666',
    marginBottom: 4,
  },
  details: {
    flexDirection: 'row',
    gap: 16,
  },
  time: {
    color: '#666',
    fontSize: 12,
  },
  distance: {
    color: '#7E3AF2',
    fontSize: 12,
  },
});

export default LocationModal; 