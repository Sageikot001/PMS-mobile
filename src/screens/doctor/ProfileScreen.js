import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorProfile } = route.params;

  const [profile, setProfile] = useState(doctorProfile);

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Profile editing functionality coming soon!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // In a real app, you'd clear user session and navigate to login
            Alert.alert('Logged Out', 'You have been logged out successfully');
          }
        }
      ]
    );
  };

  const profileSections = [
    {
      title: 'Personal Information',
      items: [
        { label: 'Full Name', value: `Dr. ${profile.firstName} ${profile.lastName}`, icon: 'person' },
        { label: 'Email', value: profile.email, icon: 'mail' },
        { label: 'Phone', value: profile.phone, icon: 'call' },
        { label: 'License Number', value: profile.licenseNumber, icon: 'document-text' },
      ]
    },
    {
      title: 'Professional Information',
      items: [
        { label: 'Specialization', value: profile.specialization, icon: 'medical' },
        { label: 'Hospital', value: profile.hospital, icon: 'business' },
        { label: 'Department', value: profile.department, icon: 'folder' },
        { label: 'Experience', value: profile.experience, icon: 'time' },
      ]
    },
    {
      title: 'Statistics',
      items: [
        { label: 'Rating', value: `${profile.rating}/5.0`, icon: 'star' },
        { label: 'Total Patients', value: profile.totalPatients.toLocaleString(), icon: 'people' },
        { label: 'Completed Appointments', value: profile.completedAppointments.toLocaleString(), icon: 'checkmark-circle' },
      ]
    }
  ];

  const renderProfileItem = (item) => (
    <View key={item.label} style={styles.profileItem}>
      <View style={styles.profileItemLeft}>
        <Ionicons name={item.icon} size={20} color="#4A90E2" />
        <Text style={styles.profileItemLabel}>{item.label}</Text>
      </View>
      <Text style={styles.profileItemValue}>{item.value}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Profile</Text>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Ionicons name="create-outline" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {profile.avatar ? (
              <Image 
                source={{ uri: profile.avatar }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={60} color="#4A90E2" />
              </View>
            )}
          </View>
          
          <Text style={styles.profileName}>
            Dr. {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.profileSpecialization}>
            {profile.specialization}
          </Text>
          <Text style={styles.profileHospital}>
            {profile.hospital}
          </Text>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderProfileItem)}
            </View>
          </View>
        ))}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle" size={24} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Help & Support</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="#dc3545" />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  editButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E9ECEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  profileSpecialization: {
    fontSize: 18,
    color: '#4A90E2',
    marginBottom: 4,
  },
  profileHospital: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
  },
  sectionContent: {
    gap: 12,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
  },
  profileItemValue: {
    fontSize: 16,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  actionButtons: {
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    marginLeft: 12,
    fontWeight: '500',
  },
  logoutButton: {
    borderColor: '#dc3545',
    borderWidth: 1,
  },
  logoutText: {
    color: '#dc3545',
  },
});

export default ProfileScreen; 