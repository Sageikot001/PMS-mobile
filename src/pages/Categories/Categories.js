import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryCard from '../../components/cards/CategoryCard';

const CATEGORIES = [
  {
    id: '1',
    title: 'Diabetes Medications',
    backgroundColor: '#FFF9E6',
    icon: '💊',
  },
  {
    id: '2',
    title: 'Hypertension',
    backgroundColor: '#E8F1FF',
    icon: '🫀',
  },
  {
    id: '3',
    title: 'Sexual Health',
    backgroundColor: '#FFE8F1',
    icon: '❤️',
  },
  {
    id: '4',
    title: 'Pregnancy & Conception',
    backgroundColor: '#E8FFF1',
    icon: '🤰',
  },
  {
    id: '5',
    title: 'Pain & Fever',
    backgroundColor: '#FFE8F1',
    icon: '🤒',
  },
  {
    id: '6',
    title: 'Eye, Ear & Nose',
    backgroundColor: '#E8F1FF',
    icon: '👁️',
  },
  {
    id: '7',
    title: 'Skincare',
    backgroundColor: '#FFF9E6',
    icon: '✨',
  },
  {
    id: '8',
    title: 'First Aid',
    backgroundColor: '#FFE8F1',
    icon: '🏥',
  },
  {
    id: '9',
    title: 'Weight Management',
    backgroundColor: '#E8F1FF',
    icon: '⚖️',
  },
  {
    id: '10',
    title: 'Supplements',
    backgroundColor: '#FFF9E6',
    icon: '🌿',
  },
  {
    id: '11',
    title: 'Fitness',
    backgroundColor: '#E8FFF1',
    icon: '🏃',
  },
  {
    id: '12',
    title: 'Mental Health',
    backgroundColor: '#FFE8F1',
    icon: '🧠',
  }
];

const Categories = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      {/* Categories Grid */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.grid}>
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              title={category.title}
              icon={category.icon}
              backgroundColor={category.backgroundColor}
              onPress={() => navigation.navigate('CategoryDetails', { category })}
              style={styles.categoryCardCustom}
            />
          ))}
        </View>
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
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  categoryCardCustom: {
    width: '47%',
    marginBottom: 0,
  }
});

export default Categories; 