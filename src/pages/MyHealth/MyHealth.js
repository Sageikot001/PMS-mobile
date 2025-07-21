import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import HealthCard from './components/HealthCard';
import HealthDataService, { HEALTH_METRIC_TYPES } from '../../services/HealthDataService';
import HealthActivityService, { ACTIVITY_TYPES } from '../../services/HealthActivityService';
import { InlineLoading } from '../../components/LoadingState';

const MyHealth = () => {
  const navigation = useNavigation();
  const [healthMetrics, setHealthMetrics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthAnalytics, setHealthAnalytics] = useState(null);
  const [quickActions, setQuickActions] = useState([]);

  // Health metrics configuration with icons and units
  const healthMetricConfigs = [
    { 
      id: HEALTH_METRIC_TYPES.WEIGHT, 
      title: 'Weight', 
      unit: 'kg', 
      icon: '⚖️',
      defaultValue: '0'
    },
    { 
      id: HEALTH_METRIC_TYPES.HEIGHT, 
      title: 'Height', 
      unit: 'cm', 
      icon: '📏',
      defaultValue: '0'
    },
    { 
      id: HEALTH_METRIC_TYPES.BLOOD_PRESSURE, 
      title: 'Blood Pressure', 
      unit: 'mmHg', 
      icon: '❤️',
      defaultValue: '0/0'
    },
    { 
      id: HEALTH_METRIC_TYPES.BMI, 
      title: 'Body Mass', 
      unit: 'kg/m²', 
      icon: '🏋️',
      defaultValue: '0'
    },
    { 
      id: HEALTH_METRIC_TYPES.BODY_FAT, 
      title: 'Body Fat', 
      unit: '%', 
      icon: '📊',
      defaultValue: '0'
    },
    { 
      id: HEALTH_METRIC_TYPES.BODY_WATER, 
      title: 'Body Water', 
      unit: '%', 
      icon: '💧',
      defaultValue: '0'
    },
    { 
      id: HEALTH_METRIC_TYPES.MUSCLE_MASS, 
      title: 'Muscle Mass', 
      unit: 'kg', 
      icon: '💪',
      defaultValue: '0'
    },
    { 
      id: HEALTH_METRIC_TYPES.HEART_RATE, 
      title: 'Heart Rate', 
      unit: 'bpm', 
      icon: '💓',
      defaultValue: '0'
    },
  ];

  // Load health data when component mounts or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadHealthData();
      loadQuickActions();
    }, [])
  );

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const [metricsData, analyticsData] = await Promise.all([
        HealthDataService.getHealthMetrics(),
        HealthDataService.getHealthAnalytics(),
      ]);
      
      setHealthMetrics(metricsData);
      setHealthAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading health data:', error);
      Alert.alert('Error', 'Failed to load health data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadQuickActions = async () => {
    try {
      const actions = await HealthActivityService.getQuickActions(4);
      setQuickActions(actions);
    } catch (error) {
      console.error('Error loading quick actions:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadHealthData(), loadQuickActions()]);
    setRefreshing(false);
  };

  const handleMetricPress = async (metricId) => {
    // Record activity
    const metric = healthMetricConfigs.find(m => m.id === metricId);
    await HealthActivityService.recordActivity(
      ACTIVITY_TYPES.HEALTH_METRIC, 
      'HealthMetricDetail',
      { metricType: metricId, metricName: metric?.title }
    );
    
    navigation.navigate('HealthMetricDetail', { metricId });
  };

  const handleQuickActionPress = async (action) => {
    // Record activity if not already recent
    if (!action.id.startsWith('recent_')) {
      const activityType = action.screen.includes('Medication') ? ACTIVITY_TYPES.MEDICATION :
                          action.screen.includes('Condition') ? ACTIVITY_TYPES.CONDITION :
                          action.screen.includes('BMI') || action.screen.includes('Calorie') ? ACTIVITY_TYPES.WELLNESS_CALC :
                          action.screen.includes('Consultation') ? ACTIVITY_TYPES.CONSULTATION :
                          ACTIVITY_TYPES.HEALTH_METRIC;
      
      await HealthActivityService.recordActivity(activityType, action.screen, action.params);
    }
    
    navigation.navigate(action.screen, action.params);
  };

  const handleManagementCardPress = async (screen, activityType) => {
    await HealthActivityService.recordActivity(activityType, screen);
    navigation.navigate(screen);
  };

  const getMetricValue = (metricId) => {
    const metricData = healthMetrics[metricId];
    const config = healthMetricConfigs.find(config => config.id === metricId);
    
    if (metricData?.current?.value) {
      // Format special cases
      if (metricId === HEALTH_METRIC_TYPES.BMI && metricData.current.category) {
        return `${metricData.current.value} (${metricData.current.category})`;
      }
      return metricData.current.value;
    }
    
    return config?.defaultValue || '0';
  };

  const getMetricTrend = (metricId) => {
    if (healthAnalytics?.trends?.[metricId]) {
      const trend = healthAnalytics.trends[metricId];
      const trendIcon = trend.direction === 'up' ? '📈' : trend.direction === 'down' ? '📉' : '➡️';
      return {
        icon: trendIcon,
        change: trend.change,
        direction: trend.direction,
      };
    }
    return null;
  };

  const renderHealthSummary = () => {
    if (!healthAnalytics) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Health Summary</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{healthAnalytics.summary.activeMedications}</Text>
            <Text style={styles.summaryLabel}>Active{'\n'}Medications</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{healthAnalytics.summary.activeConditions}</Text>
            <Text style={styles.summaryLabel}>Managed{'\n'}Conditions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{healthAnalytics.summary.recentCalculations}</Text>
            <Text style={styles.summaryLabel}>Recent{'\n'}Calculations</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Health</Text>
        <InlineLoading text="Loading your health data..." />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Text style={styles.title}>My Health</Text>
      
      {renderHealthSummary()}
      
      <View style={styles.metricsHeaderContainer}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <Text style={styles.scrollHint}>← Scroll for more</Text>
      </View>
      <ScrollView 
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.metricsContainer}
      >
        {healthMetricConfigs.map((metric) => {
          const trend = getMetricTrend(metric.id);
          return (
            <HealthCard
              key={metric.id}
              id={metric.id}
              title={metric.title}
              value={getMetricValue(metric.id)}
              unit={metric.unit}
              icon={metric.icon}
              trend={trend}
              onPress={() => handleMetricPress(metric.id)}
            />
          );
        })}
      </ScrollView>

      <TouchableOpacity 
        style={styles.managementCard}
        onPress={() => handleManagementCardPress('MedicationManagement', ACTIVITY_TYPES.MEDICATION)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Medication Management</Text>
            <Text style={styles.cardSubtitle}>
              Manage your medication schedule and never miss a dose with our reminders
            </Text>
            {healthAnalytics?.summary.activeMedications > 0 && (
              <Text style={styles.cardBadge}>
                {healthAnalytics.summary.activeMedications} active medication{healthAnalytics.summary.activeMedications > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <Text style={styles.cardIcon}>💊</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.managementCard}
        onPress={() => handleManagementCardPress('ConditionManagement', ACTIVITY_TYPES.CONDITION)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Condition Management</Text>
            <Text style={styles.cardSubtitle}>
              Manage your health conditions with our condition management support
            </Text>
            {healthAnalytics?.summary.activeConditions > 0 && (
              <Text style={styles.cardBadge}>
                {healthAnalytics.summary.activeConditions} managed condition{healthAnalytics.summary.activeConditions > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <Text style={styles.cardIcon}>🏥</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.managementCard}
        onPress={() => handleManagementCardPress('WellnessCheck', ACTIVITY_TYPES.WELLNESS_CALC)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardTitle}>Wellness Calculator</Text>
            <Text style={styles.cardSubtitle}>
              Calculate your way to a healthier you
            </Text>
            {healthAnalytics?.summary.recentCalculations > 0 && (
              <Text style={styles.cardBadge}>
                {healthAnalytics.summary.recentCalculations} recent calculation{healthAnalytics.summary.recentCalculations > 1 ? 's' : ''}
              </Text>
            )}
          </View>
          <Text style={styles.cardIcon}>📊</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.consultationCard}
        onPress={() => handleManagementCardPress('ConsultationHome', ACTIVITY_TYPES.CONSULTATION)}
      >
        <View style={styles.consultationContent}>
          <View style={styles.consultationTextContainer}>
            <Text style={styles.consultationTitle}>Book a Consultation</Text>
            <Text style={styles.consultationSubtitle}>
              Get connected to the right professional for your health
            </Text>
            <TouchableOpacity style={styles.scheduleButton}>
              <Text style={styles.scheduleButtonText}>Schedule now</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.consultationImageContainer}>
            <Text style={styles.consultationIcon}>👩‍⚕️</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>
          {quickActions.some(a => a.id.startsWith('recent_')) ? 'Recently Visited' : 'Quick Actions'}
        </Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id}
              style={styles.quickActionButton}
              onPress={() => handleQuickActionPress(action)}
            >
              <Text style={styles.quickActionIcon}>{action.icon}</Text>
              <Text style={styles.quickActionText}>{action.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    marginTop: 8,
    color: '#333',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
  metricsContainer: {
    paddingRight: 16,
    marginBottom: 20,
    gap: 8,
  },
  metricsHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  scrollHint: {
    fontSize: 14,
    color: '#666',
  },
  managementCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTextContent: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  cardBadge: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cardIcon: {
    fontSize: 32,
  },
  consultationCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  consultationContent: {
    flexDirection: 'row',
    padding: 16,
  },
  consultationTextContainer: {
    flex: 1,
    paddingRight: 16,
  },
  consultationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  consultationSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  scheduleButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  scheduleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  consultationImageContainer: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consultationIcon: {
    fontSize: 48,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default MyHealth; 