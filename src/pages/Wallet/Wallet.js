import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Wallet = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  // Calculate balance from transactions
  const calculateBalance = (transactionsList) => {
    return transactionsList.reduce((total, transaction) => {
      // Add for credits, subtract for debits
      if (transaction.type === 'credit') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
  };

  // Load transactions and calculate balance
  const loadTransactionsAndBalance = async () => {
    try {
      const storedTransactions = await AsyncStorage.getItem('transactions');
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions);
        setTransactions(parsedTransactions);
        
        // Calculate and set balance
        const calculatedBalance = calculateBalance(parsedTransactions);
        setBalance(calculatedBalance);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    }
  };

  // Check for new transactions whenever screen comes into focus
  useEffect(() => {
    // Load initial data
    loadTransactionsAndBalance();

    // Set up listener for when the component mounts
    const unsubscribe = navigation.addListener('focus', () => {
      loadTransactionsAndBalance();
    });

    // Clean up the listener when component unmounts
    return unsubscribe;
  }, [navigation]);

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

        {transactions.length > 0 ? (
          <FlatList
            data={transactions}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>{item.description}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(item.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[
                  styles.transactionAmount,
                  item.type === 'credit' ? styles.creditAmount : styles.debitAmount
                ]}>
                  {item.type === 'credit' ? '+' : '-'}₦{item.amount.toFixed(2)}
                </Text>
              </View>
            )}
            style={styles.transactionsList}
          />
        ) : (
          <View style={styles.emptyTransactions}>
            {/* <Image 
              source={ ('../../assets/card-icon.png')}
              style={styles.emptyIcon}
              resizeMode="contain"
            /> */}
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