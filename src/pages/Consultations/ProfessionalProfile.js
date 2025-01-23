import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const ProfessionalProfile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { professional } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileHeader}>
        <Image source={professional.image} style={styles.profileImage} />
        <Text style={styles.name}>{professional.name}</Text>
        <Text style={styles.specialty}>{professional.specialty}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{professional.rating}</Text>
          <Text style={styles.reviews}>({professional.reviews} reviews)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.aboutText}>
          Dr. Sarah Johnson is a highly experienced General Practitioner with over 10 years of practice. 
          She specializes in preventive care and chronic disease management.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.locationText}>{professional.hospital}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consultation Fee</Text>
        <Text style={styles.fee}>₦{professional.hourlyRate}/hour</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Times</Text>
        <View style={styles.timeSlots}>
          <TouchableOpacity style={styles.timeSlot}>
            <Text style={styles.timeText}>9:00 AM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timeSlot}>
            <Text style={styles.timeText}>10:00 AM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timeSlot}>
            <Text style={styles.timeText}>2:00 PM</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => navigation.navigate('BookAppointment', { professional })}
      >
        <Text style={styles.bookButtonText}>Book Consultation</Text>
      </TouchableOpacity>
    </ScrollView>
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
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  specialty: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 4,
    fontWeight: '600',
  },
  reviews: {
    marginLeft: 4,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
  },
  fee: {
    fontSize: 18,
    color: '#6200ee',
    fontWeight: '600',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlot: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#6200ee',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfessionalProfile; 