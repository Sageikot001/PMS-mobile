import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { pharmaciesAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const ACCENT = '#00897B';

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
];

const StatCard = ({ icon, label, value, color = ACCENT, sub }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
      <Ionicons name={icon} size={22} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
    {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
  </View>
);

const PharmacyAnalyticsScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const pharmacyId = user?.pharmacy?._id ?? user?.pharmacyId ?? null;

  const [period, setPeriod] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!pharmacyId) { setLoading(false); return; }
    try {
      const [analyticsRes, salesRes] = await Promise.all([
        pharmaciesAPI.analytics(pharmacyId, { period }),
        pharmaciesAPI.sales(pharmacyId, { period, limit: 20 }),
      ]);
      setAnalytics(analyticsRes?.data?.data ?? analyticsRes?.data ?? null);
      const rawSales = salesRes?.data?.data?.sales ?? salesRes?.data?.data ?? [];
      setSales(Array.isArray(rawSales) ? rawSales : []);
    } catch (e) {
      console.error('Error loading pharmacy analytics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pharmacyId, period]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = () => { setRefreshing(true); load(); };

  const revenue = analytics?.revenue ?? analytics?.totalRevenue ?? 0;
  const orders = analytics?.orders ?? analytics?.totalOrders ?? 0;
  const prescriptions = analytics?.prescriptions ?? analytics?.totalPrescriptions ?? 0;
  const avgOrder = orders > 0 ? revenue / orders : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.title}>Analytics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
      >
        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.periodTab, period === p.value && styles.periodTabActive]}
              onPress={() => setPeriod(p.value)}
            >
              <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={ACCENT} style={{ marginTop: 60 }} />
        ) : (
          <View style={styles.content}>
            {/* KPI grid */}
            <View style={styles.statGrid}>
              <StatCard
                icon="cash-outline"
                label="Revenue"
                value={`₦${Number(revenue).toLocaleString()}`}
                color={ACCENT}
              />
              <StatCard
                icon="cart-outline"
                label="Orders"
                value={String(orders)}
                color="#1565C0"
              />
              <StatCard
                icon="document-text-outline"
                label="Prescriptions"
                value={String(prescriptions)}
                color="#6A1B9A"
              />
              <StatCard
                icon="trending-up-outline"
                label="Avg Order"
                value={`₦${Math.round(avgOrder).toLocaleString()}`}
                color="#E65100"
              />
            </View>

            {/* Top selling items */}
            {(analytics?.topItems ?? analytics?.topProducts ?? []).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Selling Items</Text>
                {(analytics?.topItems ?? analytics?.topProducts ?? []).slice(0, 5).map((item, idx) => (
                  <View key={idx} style={styles.topItemRow}>
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.topItemInfo}>
                      <Text style={styles.topItemName}>{item.name ?? item.itemName ?? 'Item'}</Text>
                      <Text style={styles.topItemSub}>
                        {item.unitsSold ?? item.quantity ?? 0} units sold
                      </Text>
                    </View>
                    <Text style={styles.topItemRevenue}>
                      ₦{Number(item.revenue ?? item.total ?? 0).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Recent sales */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Sales</Text>
              {sales.length === 0 ? (
                <View style={styles.emptyInline}>
                  <Ionicons name="bar-chart-outline" size={40} color="#E9ECEF" />
                  <Text style={styles.emptyText}>No sales data for this period</Text>
                </View>
              ) : (
                sales.map((sale, idx) => {
                  const saleTotal = sale.total ?? sale.amount ?? 0;
                  const itemCount = sale.itemCount ?? (sale.items ?? []).length ?? 0;
                  const date = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString() : '';
                  return (
                    <View key={idx} style={styles.saleRow}>
                      <View style={styles.saleInfo}>
                        <Text style={styles.saleId}>
                          #{(sale._id ?? sale.id ?? '').slice(-6).toUpperCase() || `SALE-${idx + 1}`}
                        </Text>
                        <Text style={styles.saleMeta}>
                          {itemCount} item{itemCount !== 1 ? 's' : ''} · {date}
                        </Text>
                      </View>
                      <Text style={styles.saleTotal}>₦{Number(saleTotal).toLocaleString()}</Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        )}

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
  periodRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  periodTab: {
    flex: 1, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#F5F5F5', alignItems: 'center',
  },
  periodTabActive: { backgroundColor: ACCENT },
  periodText: { fontSize: 13, color: '#7F8C8D', fontWeight: '500' },
  periodTextActive: { color: '#fff', fontWeight: '700' },
  content: { padding: 16 },
  statGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16,
  },
  statCard: {
    width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  statIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: '700', color: '#2C3E50', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#7F8C8D', fontWeight: '500' },
  statSub: { fontSize: 11, color: '#BDBDBD', marginTop: 2 },
  section: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 12 },
  topItemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: ACCENT + '20',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  rankText: { fontSize: 13, fontWeight: '700', color: ACCENT },
  topItemInfo: { flex: 1 },
  topItemName: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
  topItemSub: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  topItemRevenue: { fontSize: 14, fontWeight: '700', color: ACCENT },
  saleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  saleInfo: { flex: 1 },
  saleId: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
  saleMeta: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  saleTotal: { fontSize: 15, fontWeight: '700', color: ACCENT },
  emptyInline: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { fontSize: 14, color: '#7F8C8D', marginTop: 8 },
});

export default PharmacyAnalyticsScreen;
