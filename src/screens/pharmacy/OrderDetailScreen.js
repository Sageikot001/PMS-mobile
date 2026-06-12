import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pharmaciesAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00897B';

const STATUS_TRANSITIONS = {
  PENDING: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

const statusColor = (s) => {
  switch (s) {
    case 'PENDING': return '#F57F17';
    case 'PROCESSING': return '#1565C0';
    case 'COMPLETED': return '#2E7D32';
    case 'CANCELLED': return '#B71C1C';
    default: return '#555';
  }
};

const OrderDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const pharmacyId = route.params?.pharmacyId ?? user?.pharmacy?._id ?? user?.pharmacyId;
  const [order, setOrder] = useState(route.params?.order ?? {});
  const [updating, setUpdating] = useState(false);

  const total = (order.items ?? []).reduce((s, i) => s + (i.price ?? 0) * (i.quantity ?? 1), 0);
  const customerName = order.customer?.name ?? order.createdBy?.name ?? 'Customer';
  const nextStatuses = STATUS_TRANSITIONS[order.status] ?? [];

  const handleStatusChange = (newStatus) => {
    Alert.alert(
      'Update Order',
      `Change order status to ${newStatus}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm', onPress: async () => {
            setUpdating(true);
            try {
              // pharmaciesAPI doesn't have a status update — use the orders create endpoint
              // The backend orders route handles status via PUT on the order
              // For now we update local state — wire to backend when PUT /orders/:id is added
              setOrder((prev) => ({ ...prev, status: newStatus }));
              Alert.alert('Updated', `Order marked as ${newStatus}`);
            } catch (e) {
              Alert.alert('Error', 'Could not update order status.');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.section}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>
              #{(order._id ?? order.id ?? '').slice(-8).toUpperCase()}
            </Text>
            <Text style={[styles.status, { color: statusColor(order.status) }]}>
              {order.status}
            </Text>
          </View>
          <Text style={styles.meta}>Customer: {customerName}</Text>
          {order.createdAt && (
            <Text style={styles.meta}>Placed: {new Date(order.createdAt).toLocaleString()}</Text>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {(order.items ?? []).length === 0 ? (
            <Text style={styles.noItems}>No items</Text>
          ) : (
            (order.items ?? []).map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name ?? item.inventory?.name ?? 'Item'}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity ?? 1}</Text>
                </View>
                <Text style={styles.itemPrice}>
                  ₦{((item.price ?? 0) * (item.quantity ?? 1)).toLocaleString()}
                </Text>
              </View>
            ))
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₦{total.toLocaleString()}</Text>
          </View>
        </View>

        {/* Status Actions */}
        {nextStatuses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Update Status</Text>
            <View style={styles.statusBtns}>
              {nextStatuses.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.statusBtn,
                    { borderColor: statusColor(s) },
                    s === 'CANCELLED' && styles.cancelBtn,
                  ]}
                  onPress={() => handleStatusChange(s)}
                  disabled={updating}
                >
                  {updating
                    ? <ActivityIndicator color={statusColor(s)} size="small" />
                    : <Text style={[styles.statusBtnText, { color: s === 'CANCELLED' ? '#B71C1C' : statusColor(s) }]}>
                        Mark {s}
                      </Text>
                  }
                </TouchableOpacity>
              ))}
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
  content: { padding: 16 },
  section: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  orderIdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 18, fontWeight: '700', color: '#2C3E50' },
  status: { fontSize: 14, fontWeight: '700' },
  meta: { fontSize: 14, color: '#7F8C8D', marginBottom: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 12 },
  noItems: { color: '#7F8C8D', fontSize: 14 },
  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#2C3E50' },
  itemQty: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: '700', color: '#2C3E50' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  totalValue: { fontSize: 18, fontWeight: '700', color: ACCENT },
  statusBtns: { flexDirection: 'row', gap: 12 },
  statusBtn: {
    flex: 1, borderWidth: 2, borderRadius: 10, paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtn: { borderColor: '#B71C1C' },
  statusBtnText: { fontSize: 14, fontWeight: '700' },
});

export default OrderDetailScreen;
