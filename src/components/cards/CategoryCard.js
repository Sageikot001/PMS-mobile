import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CategoryCard = ({ title, icon, color }) => (
  <TouchableOpacity style={[styles.categoryCard, { backgroundColor: color }]}>
    <Ionicons name={icon} size={24} color="#444" />
    <Text style={styles.categoryTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  categoryCard: {
    width: 120,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-between',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CategoryCard;
