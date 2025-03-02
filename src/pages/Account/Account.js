import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

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

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Account</Text>

      <View style={styles.profile}>
        {/* <Image 
          source={require('../../assets/avatar-placeholder.png')}
          style={styles.avatar}
        /> */}
        <Text style={styles.name}>Nsikak Ikot</Text>
        <Text style={styles.email}>ikotnsikak@gmail.com</Text>
        <Text style={styles.phone}>07078391223</Text>
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
        onPress={() => navigation.navigate('Login')}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
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
});

export default Account; 