import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SupportOption = ({ icon, title, description, onPress }) => (
  <TouchableOpacity style={styles.optionCard} onPress={onPress}>
    <View style={styles.optionIcon}>
      {icon}
    </View>
    <View style={styles.optionInfo}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={24} color="#666" />
  </TouchableOpacity>
);

const Support = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>How can we help you?</Text>

        <View style={styles.options}>
          <SupportOption
            icon={<Ionicons name="chatbubble-outline" size={24} color="#7E3AF2" />}
            title="Chat with us"
            description="Get instant help from our support team"
            onPress={() => {}}
          />

          <SupportOption
            icon={<Ionicons name="call-outline" size={24} color="#7E3AF2" />}
            title="Call us"
            description="Speak directly with a representative"
            onPress={() => {}}
          />

          <SupportOption
            icon={<Ionicons name="mail-outline" size={24} color="#7E3AF2" />}
            title="Email us"
            description="Send us your questions or feedback"
            onPress={() => {}}
          />

          <SupportOption
            icon={<Ionicons name="help-circle-outline" size={24} color="#7E3AF2" />}
            title="FAQs"
            description="Find answers to common questions"
            onPress={() => {}}
          />
        </View>

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Contact information</Text>
          <Text style={styles.contactText}>Email: support@pharmarun.com</Text>
          <Text style={styles.contactText}>Phone: 0800-PHARMARUN</Text>
          <Text style={styles.contactText}>Hours: 24/7</Text>
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
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  options: {
    padding: 16,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0e6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  contactInfo: {
    padding: 16,
    marginTop: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    margin: 16,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
});

export default Support; 