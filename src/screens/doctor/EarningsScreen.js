import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const EarningsScreen = () => {
  const navigation = useNavigation();
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');

  // Mock data
  const earningsData = {
    total: 6450,
    growth: 15.8,
    transactions: [
      { id: 1, patient: 'John Smith', type: 'Follow-up', amount: 150, status: 'Paid', date: '2024-01-15' },
      { id: 2, patient: 'Jane Doe', type: 'Consultation', amount: 85, status: 'Paid', date: '2024-01-14' },
      { id: 3, patient: 'Michael Brown', type: 'Check-up', amount: 100, status: 'Pending', date: '2024-01-13' },
      { id: 4, patient: 'Sarah Wilson', type: 'Consultation', amount: 60, status: 'Paid', date: '2024-01-12' },
      { id: 5, patient: 'David Johnson', type: 'Video Call', amount: 75, status: 'Paid', date: '2024-01-11' },
      { id: 6, patient: 'Lisa Chen', type: 'In-Person', amount: 120, status: 'Pending', date: '2024-01-10' },
    ]
  };

  const periods = ['Weekly', 'Monthly', 'Yearly'];

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
        <View style={styles.growthContainer}>
          <Ionicons name="trending-up" size={16} color="#28A745" />
          <Text style={styles.growthText}>↑ {earningsData.growth}%</Text>
        </View>
      </View>
      <Text style={styles.earningsAmount}>${earningsData.total.toLocaleString()}</Text>
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
      {earningsData.transactions.map(renderTransaction)}
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