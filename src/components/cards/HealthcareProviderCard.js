import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HealthcareProviderCard = ({ provider, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.imageContainer}>
        {/* Placeholder for provider image */}
        <View style={styles.imagePlaceholder}>
          <Ionicons 
            name={provider.type === 'pharmacist' ? 'medical' : 'medical-outline'} 
            size={30} 
            color="#7E3AF2"
          />
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{provider.name}</Text>
        <Text style={styles.specialty}>{provider.specialty}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="star" size={16} color="#FFB800" />
            <Text style={styles.statText}>{provider.rating}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={16} color="#666" />
            <Text style={styles.statText}>{provider.experience} years</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={16} color="#666" />
            <Text style={styles.statText}>{provider.consultations}+ consults</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
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
  imageContainer: {
    marginRight: 16,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
});

export default HealthcareProviderCard; 