import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HealthcareInstitutionCard = ({ institution, onPress }) => {
  const renderImage = () => {
    // If logo is null or loading fails, show placeholder
    if (!institution.logo) {
      return (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Ionicons name="medical" size={32} color="#7E3AF2" />
        </View>
      );
    }

    try {
      return (
        <Image 
          source={institution.logo} 
          style={styles.logo} 
        />
      );
    } catch (error) {
      return (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Ionicons name="medical" size={32} color="#7E3AF2" />
        </View>
      );
    }
  };
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {renderImage()}
      <Text style={styles.name}>{institution.name}</Text>
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={14} color="#7E3AF2" />
        <Text style={styles.location}>{institution.location}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.packageCount}>{institution.packageCount} packages available</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  logoPlaceholder: {
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  packageCount: {
    fontSize: 12,
    color: '#7E3AF2',
    fontWeight: '500',
  },
});

export default HealthcareInstitutionCard; 