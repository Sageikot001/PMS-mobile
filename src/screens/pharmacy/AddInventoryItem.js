import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pharmaciesAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00897B';

const Field = ({ label, value, onChangeText, placeholder, keyboardType = 'default', required }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}{required && <Text style={{ color: '#E53935' }}> *</Text>}</Text>
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

const AddInventoryItem = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const pharmacyId = route.params?.pharmacyId ?? user?.pharmacy?._id ?? user?.pharmacyId;

  // Pre-fill from route params when editing
  const existing = route.params?.item ?? null;
  const isEdit = !!existing;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    category: existing?.category ?? '',
    quantity: String(existing?.quantity ?? existing?.stock ?? ''),
    unit: existing?.unit ?? '',
    price: String(existing?.price ?? ''),
    expiryDate: existing?.expiryDate ? existing.expiryDate.split('T')[0] : '',
    batchNumber: existing?.batchNumber ?? '',
    manufacturer: existing?.manufacturer ?? '',
    reorderLevel: String(existing?.reorderLevel ?? '10'),
    storageInstructions: existing?.storageInstructions ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (val) => setForm((prev) => ({ ...prev, [key]: val }));

  const validate = () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Item name is required'); return false; }
    if (!form.quantity || isNaN(Number(form.quantity))) { Alert.alert('Required', 'Valid quantity is required'); return false; }
    if (!form.price || isNaN(Number(form.price))) { Alert.alert('Required', 'Valid price is required'); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || 'General',
        quantity: Number(form.quantity),
        unit: form.unit.trim() || 'units',
        price: Number(form.price),
        expiryDate: form.expiryDate || undefined,
        batchNumber: form.batchNumber || undefined,
        manufacturer: form.manufacturer || undefined,
        reorderLevel: Number(form.reorderLevel) || 10,
        storageInstructions: form.storageInstructions || undefined,
      };

      if (isEdit) {
        await pharmaciesAPI.inventory.update(pharmacyId, existing._id ?? existing.id, payload);
        Alert.alert('Updated', 'Inventory item updated successfully');
      } else {
        await pharmaciesAPI.inventory.create(pharmacyId, payload);
        Alert.alert('Added', 'Item added to inventory');
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Failed to save item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.title}>{isEdit ? 'Edit Item' : 'Add Inventory Item'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Field label="Item Name" value={form.name} onChangeText={set('name')} placeholder="e.g. Paracetamol 500mg" required />
        <Field label="Category" value={form.category} onChangeText={set('category')} placeholder="e.g. Pain Relief" />
        <Field label="Quantity" value={form.quantity} onChangeText={set('quantity')} placeholder="e.g. 100" keyboardType="numeric" required />
        <Field label="Unit" value={form.unit} onChangeText={set('unit')} placeholder="e.g. tablets, ml, units" />
        <Field label="Price (₦)" value={form.price} onChangeText={set('price')} placeholder="e.g. 500" keyboardType="numeric" required />
        <Field label="Expiry Date (YYYY-MM-DD)" value={form.expiryDate} onChangeText={set('expiryDate')} placeholder="e.g. 2026-12-31" />
        <Field label="Batch Number" value={form.batchNumber} onChangeText={set('batchNumber')} placeholder="e.g. BN-20240101" />
        <Field label="Manufacturer" value={form.manufacturer} onChangeText={set('manufacturer')} placeholder="e.g. Emzor Pharma" />
        <Field label="Reorder Level" value={form.reorderLevel} onChangeText={set('reorderLevel')} placeholder="Alert when stock falls below (default: 10)" keyboardType="numeric" />
        <Field label="Storage Instructions" value={form.storageInstructions} onChangeText={set('storageInstructions')} placeholder="e.g. Store below 25°C" />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>{isEdit ? 'Save Changes' : 'Add to Inventory'}</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 32 }} />
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
  title: { fontSize: 18, fontWeight: '700', color: '#2C3E50' },
  form: { padding: 20 },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#2C3E50', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 15, color: '#2C3E50',
    borderWidth: 1, borderColor: '#E9ECEF',
  },
  saveBtn: {
    backgroundColor: ACCENT, borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default AddInventoryItem;
