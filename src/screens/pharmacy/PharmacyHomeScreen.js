import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { pharmaciesAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00897B';

const StatCard = ({ icon, label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Ionicons name={icon} size={22} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const PharmacyHomeScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pharmacyId = user?.pharmacy?._id ?? user?.pharmacyId ?? null;
  const pharmacyName = user?.pharmacy?.name ?? user?.name ?? 'My Pharmacy';

  const loadAnalytics = useCallback(async () => {
    if (!pharmacyId) { setLoading(false); return; }
    try {
      const res = await pharmaciesAPI.analytics(pharmacyId, {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      });
      setAnalytics(res?.data?.data ?? null);
    } catch (e) {
      console.error('Error loading analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pharmacyId]);

  useFocusEffect(useCallback(() => { loadAnalytics(); }, [loadAnalytics]));

  const onRefresh = () => { setRefreshing(true); loadAnalytics(); };

  const quickActions = [
    { label: 'Add Stock', icon: 'add-circle-outline', screen: 'AddInventoryItem', color: ACCENT },
    { label: 'Prescriptions', icon: 'document-text-outline', screen: 'Prescriptions', color: '#7E57C2' },
    { label: 'Orders', icon: 'cart-outline', screen: 'Orders', color: '#F57C00' },
    { label: 'Analytics', icon: 'bar-chart-outline', screen: 'PharmacyAnalytics', color: '#0288D1' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()}</Text>
          <Text style={styles.pharmacyName}>{pharmacyName}</Text>
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {/* Stats */}
        {loading ? (
          <ActivityIndicator color={ACCENT} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.statsGrid}>
            <StatCard
              icon="cart-outline" label="Orders (30d)"
              value={analytics?.totalOrders ?? 0} color={ACCENT}
            />
            <StatCard
              icon="cash-outline" label="Revenue (30d)"
              value={`₦${(analytics?.totalRevenue ?? 0).toLocaleString()}`} color="#0288D1"
            />
            <StatCard
              icon="cube-outline" label="Stock Items"
              value={analytics?.inventory?.totalItems ?? '--'} color="#7E57C2"
            />
            <StatCard
              icon="warning-outline" label="Low Stock"
              value={analytics?.inventory?.lowStockItems ?? 0} color="#F57C00"
            />
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickActionCard}
              onPress={() => navigation.navigate(action.screen)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '18' }]}>
                <Ionicons name={action.icon} size={26} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Shortcut to inventory */}
        <Text style={styles.sectionTitle}>Inventory</Text>
        <TouchableOpacity
          style={styles.bannerCard}
          onPress={() => navigation.navigate('Inventory')}
        >
          <View>
            <Text style={styles.bannerTitle}>Manage Stock</Text>
            <Text style={styles.bannerSub}>View, add, and update your inventory</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={ACCENT} />
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  greeting: { fontSize: 13, color: '#7F8C8D' },
  pharmacyName: { fontSize: 20, fontWeight: '700', color: '#2C3E50' },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingTop: 20, gap: 12,
  },
  statCard: {
    flex: 1, minWidth: '44%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#2C3E50', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: '#2C3E50',
    marginHorizontal: 20, marginTop: 24, marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, gap: 12,
  },
  quickActionCard: {
    flex: 1, minWidth: '44%', backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  quickActionIcon: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  quickActionLabel: { fontSize: 13, fontWeight: '600', color: '#2C3E50' },
  bannerCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 12,
    padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  bannerTitle: { fontSize: 15, fontWeight: '600', color: '#2C3E50' },
  bannerSub: { fontSize: 13, color: '#7F8C8D', marginTop: 2 },
});

export default PharmacyHomeScreen;
