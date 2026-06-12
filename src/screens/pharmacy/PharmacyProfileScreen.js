import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, TextInput,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { pharmaciesAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00897B';

const SectionHeader = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color={ACCENT} style={styles.infoIcon} />
    <View style={styles.infoText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  </View>
);

const Field = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#BDBDBD"
      keyboardType={keyboardType}
    />
  </View>
);

const PharmacyProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const pharmacyId = user?.pharmacy?._id ?? user?.pharmacyId ?? null;

  const [pharmacy, setPharmacy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});

  const load = useCallback(async () => {
    if (!pharmacyId) { setLoading(false); return; }
    try {
      const res = await pharmaciesAPI.getById(pharmacyId);
      const data = res?.data?.data ?? res?.data ?? null;
      setPharmacy(data);
      if (data) {
        setForm({
          name: data.name ?? '',
          phone: data.phone ?? data.contactPhone ?? '',
          email: data.email ?? data.contactEmail ?? '',
          address: data.address?.street ?? data.address ?? '',
          city: data.address?.city ?? '',
          state: data.address?.state ?? '',
          licenseNumber: data.licenseNumber ?? '',
          openingTime: data.workingHours?.open ?? data.openingTime ?? '',
          closingTime: data.workingHours?.close ?? data.closingTime ?? '',
        });
      }
    } catch (e) {
      console.error('Error loading pharmacy profile:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pharmacyId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = () => { setRefreshing(true); load(); };

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        contactPhone: form.phone.trim(),
        contactEmail: form.email.trim(),
        address: {
          street: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
        },
        licenseNumber: form.licenseNumber.trim() || undefined,
        workingHours: {
          open: form.openingTime.trim() || undefined,
          close: form.closingTime.trim() || undefined,
        },
      };
      const res = await pharmaciesAPI.update(pharmacyId, payload);
      const updated = res?.data?.data ?? res?.data ?? null;
      if (updated) setPharmacy(updated);
      setEditing(false);
      Alert.alert('Saved', 'Pharmacy profile updated successfully.');
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>
        <ActivityIndicator color={ACCENT} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const displayName = pharmacy?.name ?? form.name ?? 'Pharmacy';
  const licenseNo = pharmacy?.licenseNumber ?? '—';
  const phone = pharmacy?.phone ?? pharmacy?.contactPhone ?? form.phone ?? '—';
  const email = pharmacy?.email ?? pharmacy?.contactEmail ?? form.email ?? '—';
  const addressObj = pharmacy?.address ?? {};
  const addressStr = typeof addressObj === 'string'
    ? addressObj
    : [addressObj.street, addressObj.city, addressObj.state].filter(Boolean).join(', ') || '—';
  const openHours = pharmacy?.workingHours?.open ?? pharmacy?.openingTime ?? '—';
  const closeHours = pharmacy?.workingHours?.close ?? pharmacy?.closingTime ?? '—';
  const services = pharmacy?.services ?? [];
  const insurance = pharmacy?.insuranceAccepted ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => setEditing((e) => !e)}>
          <Ionicons name={editing ? 'close-outline' : 'create-outline'} size={24} color={ACCENT} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {/* Avatar banner */}
        <View style={styles.banner}>
          <View style={styles.avatar}>
            <Ionicons name="medkit" size={40} color="#fff" />
          </View>
          <Text style={styles.pharmacyName}>{displayName}</Text>
          <View style={styles.licenseRow}>
            <Ionicons name="ribbon-outline" size={14} color={ACCENT} />
            <Text style={styles.licenseText}>License: {licenseNo}</Text>
          </View>
        </View>

        {editing ? (
          /* ——— Edit form ——— */
          <View style={styles.section}>
            <SectionHeader title="Edit Details" />
            <Field label="Pharmacy Name" value={form.name} onChangeText={set('name')} placeholder="Name" />
            <Field label="Phone" value={form.phone} onChangeText={set('phone')} placeholder="+234..." keyboardType="phone-pad" />
            <Field label="Email" value={form.email} onChangeText={set('email')} placeholder="email@example.com" keyboardType="email-address" />
            <Field label="Street Address" value={form.address} onChangeText={set('address')} placeholder="Street" />
            <Field label="City" value={form.city} onChangeText={set('city')} placeholder="City" />
            <Field label="State" value={form.state} onChangeText={set('state')} placeholder="State" />
            <Field label="License Number" value={form.licenseNumber} onChangeText={set('licenseNumber')} placeholder="e.g. PCN-12345" />
            <Field label="Opening Time" value={form.openingTime} onChangeText={set('openingTime')} placeholder="e.g. 08:00 AM" />
            <Field label="Closing Time" value={form.closingTime} onChangeText={set('closingTime')} placeholder="e.g. 10:00 PM" />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          /* ——— View mode ——— */
          <>
            <View style={styles.section}>
              <SectionHeader title="Contact Information" />
              <InfoRow icon="call-outline" label="Phone" value={phone} />
              <InfoRow icon="mail-outline" label="Email" value={email} />
              <InfoRow icon="location-outline" label="Address" value={addressStr} />
            </View>

            <View style={styles.section}>
              <SectionHeader title="Operating Hours" />
              <InfoRow icon="time-outline" label="Opens" value={openHours} />
              <InfoRow icon="time-outline" label="Closes" value={closeHours} />
            </View>

            {services.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Services Offered" />
                <View style={styles.tagWrap}>
                  {services.map((s, i) => (
                    <View key={i} style={styles.tag}>
                      <Text style={styles.tagText}>{s}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {insurance.length > 0 && (
              <View style={styles.section}>
                <SectionHeader title="Insurance Accepted" />
                <View style={styles.tagWrap}>
                  {insurance.map((ins, i) => (
                    <View key={i} style={[styles.tag, styles.tagBlue]}>
                      <Text style={[styles.tagText, styles.tagTextBlue]}>{ins}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Account info */}
            <View style={styles.section}>
              <SectionHeader title="Account" />
              <InfoRow icon="person-outline" label="Managed by" value={user?.name ?? user?.email ?? '—'} />
              <InfoRow icon="shield-checkmark-outline" label="Role" value={user?.role ?? 'PHARMACY'} />
            </View>
          </>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#B71C1C" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#2C3E50' },
  banner: {
    backgroundColor: '#fff', alignItems: 'center',
    paddingVertical: 28, paddingHorizontal: 20,
    marginBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  pharmacyName: { fontSize: 20, fontWeight: '700', color: '#2C3E50', marginBottom: 4 },
  licenseRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  licenseText: { fontSize: 13, color: ACCENT, fontWeight: '500' },
  section: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#7F8C8D', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoIcon: { marginRight: 12, marginTop: 1 },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#7F8C8D', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#2C3E50', fontWeight: '500' },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: ACCENT + '20', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontSize: 13, color: ACCENT, fontWeight: '600' },
  tagBlue: { backgroundColor: '#E3F2FD' },
  tagTextBlue: { color: '#1565C0' },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#2C3E50', marginBottom: 5 },
  input: {
    backgroundColor: '#F5F6FA', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 11, fontSize: 14, color: '#2C3E50',
    borderWidth: 1, borderColor: '#E9ECEF',
  },
  saveBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginHorizontal: 16, marginTop: 4,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 14,
    borderWidth: 1, borderColor: '#FFCDD2',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: '#B71C1C' },
});

export default PharmacyProfileScreen;
