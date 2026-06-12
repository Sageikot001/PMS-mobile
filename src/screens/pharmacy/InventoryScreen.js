import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList,
  TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { pharmaciesAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00897B';

const InventoryScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const pharmacyId = user?.pharmacy?._id ?? user?.pharmacyId ?? null;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadInventory = useCallback(async (reset = false) => {
    if (!pharmacyId) { setLoading(false); return; }
    const currentPage = reset ? 1 : page;
    try {
      const res = await pharmaciesAPI.inventory.list(pharmacyId, {
        page: currentPage, limit: 20, search: search || undefined,
      });
      const incoming = res?.data?.data?.inventory ?? res?.data?.data ?? [];
      setItems(reset ? incoming : (prev) => [...prev, ...incoming]);
      setHasMore(incoming.length === 20);
      if (reset) setPage(1);
    } catch (e) {
      console.error('Error loading inventory:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pharmacyId, page, search]);

  useFocusEffect(useCallback(() => { loadInventory(true); }, [pharmacyId, search]));

  const onRefresh = () => { setRefreshing(true); loadInventory(true); };

  const handleDelete = (item) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from inventory?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            try {
              await pharmaciesAPI.inventory.delete(pharmacyId, item._id ?? item.id);
              setItems((prev) => prev.filter((i) => (i._id ?? i.id) !== (item._id ?? item.id)));
            } catch {
              Alert.alert('Error', 'Could not remove item. Please try again.');
            }
          },
        },
      ]
    );
  };

  const isLowStock = (item) => {
    const qty = item.quantity ?? item.stock ?? 0;
    const threshold = item.reorderLevel ?? 10;
    return qty <= threshold;
  };

  const isExpiringSoon = (item) => {
    if (!item.expiryDate) return false;
    const daysLeft = (new Date(item.expiryDate) - Date.now()) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 30;
  };

  const renderItem = ({ item }) => {
    const low = isLowStock(item);
    const expiring = isExpiringSoon(item);
    return (
      <TouchableOpacity
        style={styles.itemCard}
        onPress={() => navigation.navigate('AddInventoryItem', { item, pharmacyId })}
      >
        <View style={styles.itemLeft}>
          <View style={styles.itemIconBox}>
            <Ionicons name="medkit-outline" size={22} color={ACCENT} />
          </View>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemMeta}>
              {item.category ?? 'General'} • {item.unit ?? 'units'}
            </Text>
            <View style={styles.badgeRow}>
              {low && <View style={[styles.badge, styles.badgeLow]}><Text style={styles.badgeText}>Low Stock</Text></View>}
              {expiring && <View style={[styles.badge, styles.badgeExpiring]}><Text style={styles.badgeText}>Expiring Soon</Text></View>}
            </View>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemQty}>{item.quantity ?? item.stock ?? 0}</Text>
          <Text style={styles.itemQtyLabel}>in stock</Text>
          <Text style={styles.itemPrice}>₦{(item.price ?? 0).toLocaleString()}</Text>
          <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="trash-outline" size={18} color="#E53935" style={{ marginTop: 6 }} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddInventoryItem', { pharmacyId })}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#7F8C8D" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medications..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#7F8C8D"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#7F8C8D" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={ACCENT} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id ?? item.id ?? Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          onEndReached={() => { if (hasMore) { setPage((p) => p + 1); loadInventory(); } }}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={60} color="#E9ECEF" />
              <Text style={styles.emptyText}>No inventory items</Text>
              <Text style={styles.emptySub}>Tap + to add your first item</Text>
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#2C3E50' },
  addBtn: {
    backgroundColor: ACCENT, width: 36, height: 36,
    borderRadius: 18, justifyContent: 'center', alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', margin: 16, paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, borderWidth: 1, borderColor: '#E9ECEF',
  },
  searchInput: { flex: 1, fontSize: 15, color: '#2C3E50' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  itemCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12,
    padding: 14, marginBottom: 12, justifyContent: 'space-between', alignItems: 'flex-start',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  itemLeft: { flexDirection: 'row', flex: 1, marginRight: 12 },
  itemIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#E0F2F1', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: '#2C3E50' },
  itemMeta: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeLow: { backgroundColor: '#FFF3E0' },
  badgeExpiring: { backgroundColor: '#FCE4EC' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#2C3E50' },
  itemRight: { alignItems: 'flex-end' },
  itemQty: { fontSize: 20, fontWeight: '700', color: '#2C3E50' },
  itemQtyLabel: { fontSize: 11, color: '#7F8C8D' },
  itemPrice: { fontSize: 13, fontWeight: '600', color: ACCENT, marginTop: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#2C3E50', marginTop: 16 },
  emptySub: { fontSize: 14, color: '#7F8C8D', marginTop: 6 },
});

export default InventoryScreen;
