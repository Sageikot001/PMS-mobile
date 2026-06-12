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
const STATUS_FILTERS = ['ALL', 'PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'];

const statusColor = (s) => {
  switch (s) {
    case 'PENDING': return { bg: '#FFF8E1', text: '#F57F17' };
    case 'PROCESSING': return { bg: '#E3F2FD', text: '#1565C0' };
    case 'COMPLETED': return { bg: '#E8F5E9', text: '#2E7D32' };
    case 'CANCELLED': return { bg: '#FFEBEE', text: '#B71C1C' };
    default: return { bg: '#F5F5F5', text: '#555' };
  }
};

const OrdersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const pharmacyId = user?.pharmacy?._id ?? user?.pharmacyId ?? null;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const load = useCallback(async () => {
    if (!pharmacyId) { setLoading(false); return; }
    try {
      const res = await pharmaciesAPI.orders.list(pharmacyId, {
        status: filter === 'ALL' ? undefined : filter,
        limit: 50,
      });
      setOrders(res?.data?.data?.orders ?? res?.data?.data ?? []);
    } catch (e) {
      console.error('Error loading orders:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pharmacyId, filter]);

  useFocusEffect(useCallback(() => { load(); }, [load]));
  const onRefresh = () => { setRefreshing(true); load(); };

  const renderItem = ({ item }) => {
    const colors = statusColor(item.status);
    const itemCount = (item.items ?? []).length;
    const total = (item.items ?? []).reduce((sum, i) => sum + (i.price ?? 0) * (i.quantity ?? 1), 0);
    const customerName = item.customer?.name ?? item.createdBy?.name ?? 'Customer';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetail', { order: item, pharmacyId })}
      >
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>Order #{(item._id ?? item.id ?? '').slice(-6).toUpperCase()}</Text>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.customerName}>{customerName}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.itemCount}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          <Text style={styles.total}>₦{total.toLocaleString()}</Text>
        </View>
        <Text style={styles.date}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
      </View>

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
          data={orders}
          keyExtractor={(item) => item._id ?? item.id ?? Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cart-outline" size={60} color="#E9ECEF" />
              <Text style={styles.emptyText}>No orders yet</Text>
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
    flexDirection: 'row', backgroundColor: '#fff', flexWrap: 'wrap',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  filterTab: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 20, backgroundColor: '#F5F5F5',
  },
  filterTabActive: { backgroundColor: ACCENT },
  filterText: { fontSize: 12, color: '#7F8C8D', fontWeight: '500' },
  filterTextActive: { color: '#fff', fontWeight: '700' },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
  },
  orderId: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  customerName: { fontSize: 13, color: '#7F8C8D', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemCount: { fontSize: 14, color: '#555' },
  total: { fontSize: 15, fontWeight: '700', color: ACCENT },
  date: { fontSize: 12, color: '#BDBDBD' },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: '#7F8C8D', marginTop: 12 },
});

export default OrdersScreen;
