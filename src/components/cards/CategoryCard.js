import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CategoryCard = ({ 
  title, 
  icon, 
  backgroundColor = '#f5f5f5',
  width = '31%',
  onPress,
  style
}) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={[
        styles.categoryCard, 
        { backgroundColor, width },
        style
      ]}
      onPress={onPress}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryName}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  categoryCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    aspectRatio: 1,
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
});

export default CategoryCard;
