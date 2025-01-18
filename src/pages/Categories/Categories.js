import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES = [
  {
    id: '1',
    title: 'Diabetes Medications',
    backgroundColor: '#FFF9E6',
    // Add image reference once you have the assets
  },
  {
    id: '2',
    title: 'Hypertension',
    backgroundColor: '#E8F1FF',
  },
  {
    id: '3',
    title: 'Sexual Health',
    backgroundColor: '#FFE8F1',
  },
  {
    id: '4',
    title: 'Pregnancy & conception',
    backgroundColor: '#E8FFF1',
  },
  {
    id: '5',
    title: 'Pain & Fever Management',
    backgroundColor: '#FFE8F1',
  },
  {
    id: '6',
    title: 'Eye, Ear & Nose Care',
    backgroundColor: '#E8F1FF',
  },
  {
    id: '7',
    title: 'Skincare',
    backgroundColor: '#FFF9E6',
  },
  {
    id: '8',
    title: 'First Aid',
    backgroundColor: '#FFE8F1',
  },
  // Add all other categories from the images...
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
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: category.backgroundColor }]}
              onPress={() => {
                // Handle category selection
              }}
            >
              {/* Add your image component here once you have the assets */}
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </TouchableOpacity>
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
    paddingTop: 48, // Adjust for status bar
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
    padding: 8,
  },
  categoryCard: {
    width: '47%', // Slightly less than half to account for gap
    aspectRatio: 1,
    margin: '1.5%',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

export default Categories; 