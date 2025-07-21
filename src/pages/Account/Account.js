import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const Account = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const menuItems = [
    {
      title: 'Personal Details',
      icon: 'person-outline',
      screen: 'PersonalDetails',
    },
    {
      title: 'Family & Friends',
      icon: 'people-outline',
      screen: 'FamilyAndFriends',
    },
    {
      title: 'Address Management',
      icon: 'location-outline',
      screen: 'AddressManagement',
    },
    {
      title: 'Security Settings',
      icon: 'shield-outline',
      screen: 'SecuritySettings',
    },
    {
      title: 'Support',
      icon: 'help-circle-outline',
      screen: 'Support',
    },
    {
      title: 'About',
      icon: 'information-circle-outline',
      screen: 'About',
    },
    {
      title: 'Terms & Conditions',
      icon: 'document-text-outline',
      screen: 'Terms',
    },
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity
      key={item.title}
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.menuItemLeft}>
        <Ionicons name={item.icon} size={24} color="#333" style={styles.menuIcon} />
        <Text style={styles.menuText}>{item.title}</Text>
        {item.badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
            </View>
        </View>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
        
        {/* Patient Badge */}
        <View style={styles.roleBadge}>
          <Ionicons 
            name="person" 
            size={16} 
            color="#fff" 
            style={styles.roleBadgeIcon}
          />
          <Text style={styles.roleBadgeText}>Patient</Text>
        </View>
      </View>

      {/* Menu Items */}
        <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.menuContainer}>
          {menuItems.map(renderMenuItem)}
        </View>
      </View>

      {/* Demo Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Demo & Testing</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('UserManagementExample')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="code-outline" size={24} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuText}>Integration Example</Text>
              <View style={[styles.badge, { backgroundColor: '#ff9800' }]}>
                <Text style={styles.badgeText}>Demo</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

        <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('ConsultationHome')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="calendar-outline" size={24} color="#333" style={styles.menuIcon} />
              <Text style={styles.menuText}>Book Test Appointment</Text>
              <View style={[styles.badge, { backgroundColor: '#4caf50' }]}>
                <Text style={styles.badgeText}>Test</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          PMS Mobile v1.0.0 • Patient Portal
        </Text>
      </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#007bff',
  },
  roleBadgeIcon: {
    marginRight: 6,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  menuContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  badge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default Account; 