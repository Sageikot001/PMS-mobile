import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const FamilyMember = ({ name, relation, phone }) => (
  <View style={styles.memberCard}>
    <View style={styles.memberInfo}>
      <Text style={styles.memberName}>{name}</Text>
      <Text style={styles.memberRelation}>{relation}</Text>
      <Text style={styles.memberPhone}>{phone}</Text>
    </View>
    <TouchableOpacity>
      <Ionicons name="ellipsis-vertical" size={24} color="#666" />
    </TouchableOpacity>
  </View>
);

const FamilyAndFriends = () => {
  const navigation = useNavigation();
  const members = [
    {
      id: '1',
      name: 'Sarah Johnson',
      relation: 'Wife',
      phone: '07012345678',
    },
    {
      id: '2',
      name: 'David Ikot',
      relation: 'Son',
      phone: '07087654321',
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family and friends</Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color="#7E3AF2" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={members}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FamilyMember
            name={item.name}
            relation={item.relation}
            phone={item.phone}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No family members or friends added yet
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => {}}>
        <Text style={styles.addButtonText}>Add family member</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    gap: 16,
  },
  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 16,
  },
  memberInfo: {
    gap: 4,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberRelation: {
    fontSize: 14,
    color: '#666',
  },
  memberPhone: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#7E3AF2',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FamilyAndFriends; 