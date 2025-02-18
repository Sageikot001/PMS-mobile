import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PharmacyProfile = ({ route }) => {
  const { pharmacy } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="business" size={48} color="#7E3AF2" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{pharmacy.name}</Text>
        <Text style={styles.type}>
          {pharmacy.isChain ? 'Chain Pharmacy' : 'Local Pharmacy'}
        </Text>

        {pharmacy.isChain ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locations</Text>
            {pharmacy.locations.map(location => (
              <View key={location.id} style={styles.locationCard}>
                <Text style={styles.locationName}>{location.name}</Text>
                <Text style={styles.locationAddress}>{location.address}</Text>
                <Text style={styles.locationHours}>
                  Hours: {location.openTime} - {location.closeTime}
                </Text>
                <Text style={styles.locationRating}>
                  Rating: {location.rating} ⭐️
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationCard}>
              <Text style={styles.locationAddress}>{pharmacy.address}</Text>
              <Text style={styles.locationHours}>
                Hours: {pharmacy.openTime} - {pharmacy.closeTime}
              </Text>
              <Text style={styles.locationRating}>
                Rating: {pharmacy.rating} ⭐️
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>
            {pharmacy.description || 'A trusted pharmacy providing quality healthcare products and services to our community.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 200,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  type: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  locationHours: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  locationRating: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default PharmacyProfile; 