import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PackageCard from '../../components/cards/PackageCard';

const InstitutionPackages = ({ route, navigation }) => {
  const { institution } = route.params;

  const renderImage = () => {
    // If logo is null or loading fails, show placeholder
    if (!institution.logo) {
      return (
        <View style={[styles.logo, styles.logoPlaceholder]}>
          <Ionicons name="medical" size={40} color="#7E3AF2" />
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
          <Ionicons name="medical" size={40} color="#7E3AF2" />
        </View>
      );
    }
  };

  const handlePackagePress = (packageData) => {
    navigation.navigate('PackageDetails', { packageData, institution });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.institutionHeader}>
        {renderImage()}
        <View style={styles.institutionInfo}>
          <Text style={styles.institutionName}>{institution.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#7E3AF2" />
            <Text style={styles.locationText}>{institution.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Available Packages</Text>
      <Text style={styles.sectionSubtitle}>
        {institution.packageCount} healthcare packages available
      </Text>

      <FlatList
        data={institution.packages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PackageCard 
            packageData={item}
            onPress={() => handlePackagePress(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    padding: 16,
  },
  institutionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  logoPlaceholder: {
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  institutionInfo: {
    flex: 1,
  },
  institutionName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
});

export default InstitutionPackages; 