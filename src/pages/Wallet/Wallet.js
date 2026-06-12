import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { patientApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const Wallet = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculate balance from a list of payment records
  const calculateBalance = (list) =>
    list.reduce((total, t) => {
      const amount = typeof t.amount === 'number' ? t.amount : 0;
      return t.type === 'credit' ? total + amount : total - amount;
    }, 0);

  // Load payments from backend; fall back to empty list on error
  const loadTransactionsAndBalance = async () => {
    const patientId = user?.patient?._id ?? user?.patientId ?? null;
    if (!patientId) return;

    setLoading(true);
    try {
      const res = await patientApi.getPayments(patientId, { limit: 50 });
      const payments = res?.data?.data?.payments ?? res?.data?.data ?? [];

      // Normalise backend payment records to the shape the UI expects:
      // { id, description, date, amount, type: 'credit' | 'debit' }
      const normalised = payments.map((p) => ({
        id: p._id ?? p.id,
        description: p.description ?? p.reason ?? p.type ?? 'Transaction',
        date: p.createdAt ?? p.date,
        amount: p.amount ?? 0,
        type: p.type === 'credit' ? 'credit' : 'debit',
      }));

      setTransactions(normalised);
      setBalance(calculateBalance(normalised));
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever the screen comes into focus
  useEffect(() => {
    loadTransactionsAndBalance();
    const unsubscribe = navigation.addListener('focus', loadTransactionsAndBalance);
    return unsubscribe;
  }, [navigation, user]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wallet</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available balance</Text>
        <Text style={styles.balanceAmount}>₦{balance.toFixed(2)}</Text>
        <TouchableOpacity 
          style={styles.topUpButton}
          onPress={() => navigation.navigate('TopUp')}>
          <Text style={styles.topUpButtonText}>+ Top up</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.transactionsHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#7E3AF2" style={{ marginTop: 40 }} />
        ) : transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>{item.description}</Text>
                  <Text style={styles.transactionDate}>
                    {item.date ? new Date(item.date).toLocaleDateString() : ''}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  item.type === 'credit' ? styles.creditAmount : styles.debitAmount,
                ]}>
                  {item.type === 'credit' ? '+' : '-'}₦{item.amount.toFixed(2)}
                </Text>
              </View>
            )}
            style={styles.transactionsList}
          />
        ) : (
          <View style={styles.emptyTransactions}>
            <Text style={styles.emptyTitle}>No recent transactions</Text>
            <Text style={styles.emptySubtitle}>You have no transaction history</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  balanceCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f8f0ff',
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  topUpButton: {
    backgroundColor: '#7E3AF2',
    padding: 16,
    borderRadius: 8,
  },
  topUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  transactionsSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  viewAllText: {
    fontSize: 16,
    color: '#7E3AF2',
    fontWeight: '500',
  },
  transactionsList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  creditAmount: {
    color: '#10B981',
  },
  debitAmount: {
    color: '#EF4444',
  },
  emptyTransactions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default Wallet; 