import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchInput = ({ value, onChangeText, placeholder }) => {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#666" />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});

export default SearchInput; 