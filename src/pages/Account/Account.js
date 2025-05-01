import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';

const MenuItem = ({ icon, title, onPress, showSwitch, isEnabled, onToggle }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={styles.menuItemText}>{title}</Text>
    </View>
    {showSwitch ? (
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: '#e0e0e0', true: '#7E3AF2' }}
      />
    ) : (
      <Ionicons name="chevron-forward" size={24} color="#666" />
    )}
  </TouchableOpacity>
);

const Account = () => {
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const navigation = useNavigation();
  const { user, logout, loading } = useAuth();

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await logout();
              // No need to navigate - auth context will handle this
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return '??';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    } else if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Account</Text>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          {user?.profilePicture ? (
            <Image 
              source={{ uri: user.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.initialsAvatar}>
              <Text style={styles.initialsText}>{getUserInitials()}</Text>
            </View>
          )}
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>
        </View>

        <View style={styles.section}>
          <MenuItem
            icon={<Ionicons name="person-outline" size={24} color="#7E3AF2" />}
            title="Personal details"
            onPress={() => navigation.navigate('PersonalDetails')}
          />
          <MenuItem
            icon={<Ionicons name="people-outline" size={24} color="#7E3AF2" />}
            title="Family and friends"
            onPress={() => navigation.navigate('FamilyAndFriends')}
          />
          <MenuItem
            icon={<Ionicons name="location-outline" size={24} color="#7E3AF2" />}
            title="Address management"
            onPress={() => navigation.navigate('AddressManagement')}
          />
          <MenuItem
            icon={<Ionicons name="gift-outline" size={24} color="#7E3AF2" />}
            title="Referrals"
            onPress={() => navigation.navigate('Referrals')}
          />
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>

        <View style={styles.section}>
          <MenuItem
            icon={<Ionicons name="notifications-outline" size={24} color="#0084FF" />}
            title="Push notifications"
            showSwitch={true}
            isEnabled={pushEnabled}
            onToggle={setPushEnabled}
          />
          <MenuItem
            icon={<Ionicons name="shield-checkmark-outline" size={24} color="#0084FF" />}
            title="Security settings"
            onPress={() => navigation.navigate('SecuritySettings')}
          />
        </View>

        <View style={styles.section}>
          <MenuItem
            icon={<Ionicons name="help-circle-outline" size={24} color="#00B383" />}
            title="Support"
            onPress={() => navigation.navigate('Support')}
          />
          <MenuItem
            icon={<Ionicons name="information-circle-outline" size={24} color="#00B383" />}
            title="About Pharmarun"
            onPress={() => navigation.navigate('About')}
          />
          <MenuItem
            icon={<Ionicons name="document-text-outline" size={24} color="#00B383" />}
            title="Terms and conditions"
            onPress={() => navigation.navigate('Terms')}
          />
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}>
          <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        
        {/* Add some bottom padding for better scrolling experience */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    padding: 16,
  },
  profile: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  initialsAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#7E3AF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  initialsText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  phone: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
  },
  bottomPadding: {
    height: 20,
  },
});

export default Account; 