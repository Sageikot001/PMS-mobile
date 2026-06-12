import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { pharmaciesAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00897B';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

const statusColor = (s) => {
  switch (s) {
    case 'ACTIVE': return { bg: '#E3F2FD', text: '#1565C0' };
    case 'COMPLETED': return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'CANCELLED': return { bg: '#FFEBEE', text: '#B71C1C' };
    default: return { bg: '#F5F5F5', text: '#555' };
  }
};

const PharmacyPrescriptionQueue = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const pharmacyId = user?.pharmacy?._id ?? user?.pharmacyId ?? null;

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    if (!pharmacyId) { setLoading(false); return; }
    try {
      const res = await pharmaciesAPI.prescriptions.list(pharmacyId, {
        status: filter === 'ALL' ? undefined : filter,
        limit: 50,
      });
      setPrescriptions(res?.data?.data?.prescriptions ?? res?.data?.data ?? []);
    } catch (e) {
      console.error('Error loading prescriptions:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pharmacyId, filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = () => { setRefreshing(true); load(); };

  const renderItem = ({ item }) => {
    const colors = statusColor(item.status);
    const patientName = item.patient?.user?.name ?? item.patient?.name ?? 'Patient';
    const doctorName = item.doctor?.user?.name ?? item.doctor?.name ?? 'Doctor';
    const drugsList = (item.medications ?? []).map((m) => m.name).join(', ') || 'See details';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PrescriptionDetail', { prescription: item, pharmacyId })}
      >
        <View style={styles.cardTop}>
          <Text style={styles.patientName}>{patientName}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.meta}>Dr. {doctorName}</Text>
        <Text style={styles.drugs} numberOfLines={2}>{drugsList}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.date}>
            {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
          </Text>
          {item.status === 'ACTIVE' && (
            <View style={styles.actionHint}>
              <Text style={styles.actionHintText}>Verify & Dispense</Text>
              <Ionicons name="chevron-forward" size={14} color={ACCENT} />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
      </View>

      {/* Status filter tabs */}
      <View style={styles.filters}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item._id ?? item.id ?? Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={60} color="#E9ECEF" />
              <Text style={styles.emptyText}>No prescriptions</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#2C3E50' },
  filters: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, backgroundColor: '#F5F5F5',
  },
  filterTabActive: { backgroundColor: ACCENT },
  filterText: { fontSize: 13, color: '#7F8C8D', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  patientName: { fontSize: 16, fontWeight: '700', color: '#2C3E50' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  meta: { fontSize: 13, color: '#7F8C8D', marginBottom: 6 },
  drugs: { fontSize: 14, color: '#2C3E50' },
  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10,
  },
  date: { fontSize: 12, color: '#BDBDBD' },
  actionHint: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionHintText: { fontSize: 13, color: ACCENT, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#7F8C8D', marginTop: 12 },
});

export default PharmacyPrescriptionQueue;
