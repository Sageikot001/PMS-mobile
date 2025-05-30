import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import placeholderImage from '../../../assets/images/hospitals/placeholder.png';

const HospitalCard = ({ hospital, onPress }) => {
  const handleCall = () => {
    Linking.openURL(`tel:${hospital.phoneNumber}`);
  };
  
  const renderImage = () => {
    try {
      return (
        <Image 
          source={hospital.image} 
          style={styles.image} 
          defaultSource={placeholderImage}
        />
      );
    } catch (error) {
      return (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Ionicons name="medical" size={32} color="#7E3AF2" />
        </View>
      );
    }
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={handleCall}>
      {renderImage()}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{hospital.name}</Text>
        
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Ionicons name="car-outline" size={16} color="#7E3AF2" />
            <Text style={styles.detailText}>{hospital.ambulanceCount} Vehicles</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#7E3AF2" />
            <Text style={styles.detailText}>{hospital.eta} min ETA</Text>
          </View>
        </View>
        
        <View style={styles.phoneContainer}>
          <Ionicons name="call-outline" size={16} color="#7E3AF2" />
          <Text style={styles.phoneNumber}>{hospital.phoneNumber}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    marginRight: 16,
  },
  imagePlaceholder: {
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#7E3AF2',
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default HospitalCard; 