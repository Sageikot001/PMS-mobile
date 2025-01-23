import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const SAMPLE_PROFESSIONALS = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    type: 'doctor',
    specialty: 'General Practitioner',
    hospital: 'City General Hospital',
    rating: 4.8,
    reviews: 124,
    hourlyRate: 5000,
    availability: 'Available today',
    // image: require('../../../assets/doctor-placeholder.png'),
  },
  // Add more sample professionals...
];

const HealthcareProfessionals = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { type } = route.params; // 'doctor' or 'pharmacist'
  const [searchQuery, setSearchQuery] = useState('');

  const professionals = SAMPLE_PROFESSIONALS.filter(
    pro => pro.type === type
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === 'doctor' ? 'Doctors' : 'Pharmacists'}
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${type}s...`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.professionalsList}>
        {professionals.map(professional => (
          <TouchableOpacity
            key={professional.id}
            style={styles.professionalCard}
            onPress={() => navigation.navigate('ProfessionalProfile', { professional })}
          >
            <Image source={professional.image} style={styles.profileImage} />
            <View style={styles.professionalInfo}>
              <Text style={styles.name}>{professional.name}</Text>
              <Text style={styles.specialty}>{professional.specialty}</Text>
              <Text style={styles.hospital}>{professional.hospital}</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.rating}>{professional.rating}</Text>
                <Text style={styles.reviews}>({professional.reviews} reviews)</Text>
              </View>
              <Text style={styles.rate}>₦{professional.hourlyRate}/hour</Text>
            </View>
            <Text style={[
              styles.availability,
              { color: professional.availability.includes('Available') ? '#4CAF50' : '#666' }
            ]}>
              {professional.availability}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  professionalsList: {
    padding: 16,
  },
  professionalCard: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  professionalInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  hospital: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    marginLeft: 4,
    fontWeight: '600',
  },
  reviews: {
    marginLeft: 4,
    color: '#666',
  },
  rate: {
    color: '#6200ee',
    fontWeight: '600',
  },
  availability: {
    position: 'absolute',
    top: 16,
    right: 16,
    fontSize: 12,
  },
});

export default HealthcareProfessionals; 