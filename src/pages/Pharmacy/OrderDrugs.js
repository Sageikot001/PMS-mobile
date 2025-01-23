import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CategoryCard from '../../components/cards/CategoryCard';

const OrderDrugs = () => {
  const navigation = useNavigation();

  const categories = [
    {
      id: '1',
      title: 'Weight Management',
      icon: '💊',
      backgroundColor: '#f5f5f5',
    },
    {
      id: '2',
      title: 'Supplements',
      icon: '🌿',
      backgroundColor: '#f5f5f5',
    },
    {
      id: '3',
      title: 'Fitness',
      icon: '🏃',
      backgroundColor: '#f5f5f5',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Order Drugs</Text>
      <Text style={styles.subtitle}>
        Search and order medications from verified pharmacies
      </Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for medications..."
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Common Categories</Text>
        <View style={styles.categories}>
          {categories.map(category => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              backgroundColor={category.backgroundColor}
              onPress={() => navigation.navigate('CategoryDetails', { category })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    padding: 8,
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});

export default OrderDrugs; 