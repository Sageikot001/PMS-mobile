import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { analyticsAPI } from '../../lib/api';

const { width } = Dimensions.get('window');

const PERIOD_PARAM = {
  Weekly: 'weekly',
  Monthly: 'monthly',
  Yearly: 'yearly',
};

const EarningsScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');
  const [loading, setLoading] = useState(false);
  const [earningsData, setEarningsData] = useState({
    total: 0,
    growth: 0,
    transactions: [],
  });

  const periods = ['Weekly', 'Monthly', 'Yearly'];

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.revenue({ period: PERIOD_PARAM[selectedPeriod] });
      const data = res?.data?.data ?? res?.data ?? {};

      // Normalise the API response — backend may return different shapes
      setEarningsData({
        total: data.totalRevenue ?? data.total ?? 0,
        growth: data.growthPercent ?? data.growth ?? 0,
        transactions: (data.transactions ?? data.recentPayments ?? []).map((t, idx) => ({
          id: t._id ?? t.id ?? idx,
          patient: t.patientName ?? t.patient?.name ?? t.patient ?? 'Patient',
          type: t.appointmentType ?? t.type ?? 'Consultation',
          amount: t.amount ?? 0,
          status: t.status ?? 'Paid',
          date: t.date ?? t.createdAt ?? '',
        })),
      });
    } catch (error) {
      console.error('Error loading earnings:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useFocusEffect(useCallback(() => { loadEarnings(); }, [loadEarnings]));
  useEffect(() => { loadEarnings(); }, [selectedPeriod]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer?.()}>
        <Ionicons name="menu" size={24} color="#2C3E50" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Earnings</Text>
      <TouchableOpacity>
        <Ionicons name="person-circle-outline" size={30} color="#2C3E50" />
      </TouchableOpacity>
    </View>
  );

  const renderEarningsCard = () => (
    <View style={styles.earningsCard}>
      <View style={styles.earningsHeader}>
        <Text style={styles.earningsLabel}>Total Earnings</Text>
        {earningsData.growth !== 0 && (
          <View style={styles.growthContainer}>
            <Ionicons name="trending-up" size={16} color="#28A745" />
            <Text style={styles.growthText}>↑ {earningsData.growth}%</Text>
          </View>
        )}
      </View>
      {loading ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : (
        <Text style={styles.earningsAmount}>₦{earningsData.total.toLocaleString()}</Text>
      )}
    </View>
  );

  const renderChart = () => (
    <View style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <View style={styles.periodButtons}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.activePeriodButton
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[
                styles.periodButtonText,
                selectedPeriod === period && styles.activePeriodButtonText
              ]}>
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Simple chart visualization */}
      <View style={styles.chartArea}>
        <View style={styles.chartLine}>
          {/* Chart points */}
          <View style={[styles.chartPoint, { left: '10%', bottom: '20%' }]} />
          <View style={[styles.chartPoint, { left: '25%', bottom: '40%' }]} />
          <View style={[styles.chartPoint, { left: '40%', bottom: '35%' }]} />
          <View style={[styles.chartPoint, { left: '55%', bottom: '60%' }]} />
          <View style={[styles.chartPoint, { left: '70%', bottom: '55%' }]} />
          <View style={[styles.chartPoint, { left: '85%', bottom: '80%' }]} />
          
          {/* Connecting line */}
          <View style={styles.trendLine} />
        </View>
      </View>
    </View>
  );

  const renderTransaction = (transaction) => (
    <View key={transaction.id} style={styles.transactionItem}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionPatient}>{transaction.patient}</Text>
        <Text style={styles.transactionType}>{transaction.type}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text style={styles.transactionAmount}>${transaction.amount}</Text>
        <View style={[
          styles.statusBadge,
          transaction.status === 'Paid' ? styles.paidBadge : styles.pendingBadge
        ]}>
          <Text style={[
            styles.statusText,
            transaction.status === 'Paid' ? styles.paidText : styles.pendingText
          ]}>
            {transaction.status}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTransactionsList = () => (
    <View style={styles.transactionsSection}>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {loading ? (
        <ActivityIndicator color="#4A90E2" style={{ marginVertical: 20 }} />
      ) : earningsData.transactions.length > 0 ? (
        earningsData.transactions.map(renderTransaction)
      ) : (
        <Text style={{ color: '#7F8C8D', textAlign: 'center', marginVertical: 20 }}>
          No transactions for this period.
        </Text>
      )}
    </View>
  );

  const renderDownloadButton = () => (
    <TouchableOpacity style={styles.downloadButton}>
      <Text style={styles.downloadButtonText}>Download Statement</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderEarningsCard()}
        {renderChart()}
        {renderTransactionsList()}
        {renderDownloadButton()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
  },
  earningsCard: {
    backgroundColor: '#2C3E50',
    borderRadius: 16,
    padding: 25,
    margin: 20,
    marginBottom: 15,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  growthText: {
    fontSize: 14,
    color: '#28A745',
    fontWeight: '600',
    marginLeft: 5,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    marginTop: 5,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    marginBottom: 20,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activePeriodButton: {
    backgroundColor: '#4A90E2',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activePeriodButtonText: {
    color: '#ffffff',
  },
  chartArea: {
    height: 120,
    position: 'relative',
  },
  chartLine: {
    flex: 1,
    position: 'relative',
  },
  chartPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
  },
  trendLine: {
    position: 'absolute',
    left: '10%',
    right: '15%',
    top: '50%',
    height: 2,
    backgroundColor: '#4A90E2',
    transform: [{ rotate: '15deg' }],
  },
  transactionsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    margin: 20,
    marginTop: 5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionPatient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paidBadge: {
    backgroundColor: '#E8F5E8',
  },
  pendingBadge: {
    backgroundColor: '#FFF3CD',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: '#28A745',
  },
  pendingText: {
    color: '#856404',
  },
  downloadButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 12,
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default EarningsScreen; 