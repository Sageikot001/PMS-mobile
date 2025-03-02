import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const SecurityOption = ({ title, description, showSwitch, isEnabled, onToggle, onPress }) => (
  <TouchableOpacity style={styles.optionCard} onPress={onPress}>
    <View style={styles.optionInfo}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
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

const SecuritySettings = () => {
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.section}>
        <SecurityOption
          title="Change password"
          description="Update your account password"
          onPress={() => {}}
        />

        <SecurityOption
          title="Biometric login"
          description="Use fingerprint or face ID to login"
          showSwitch={true}
          isEnabled={biometricEnabled}
          onToggle={setBiometricEnabled}
        />

        <SecurityOption
          title="Two-factor authentication"
          description="Add an extra layer of security"
          showSwitch={true}
          isEnabled={twoFactorEnabled}
          onToggle={setTwoFactorEnabled}
        />

        <SecurityOption
          title="Manage devices"
          description="See all devices logged into your account"
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity style={styles.deactivateButton}>
        <Text style={styles.deactivateButtonText}>Deactivate account</Text>
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
  section: {
    padding: 16,
    gap: 16,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
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
  deactivateButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deactivateButtonText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default SecuritySettings; 