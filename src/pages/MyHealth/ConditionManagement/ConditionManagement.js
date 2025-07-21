import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  RefreshControl,
  Alert,
  ActivityIndicator 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import HealthDataService, { CONDITION_STATUS } from '../../../services/HealthDataService';

const ConditionManagement = () => {
  const navigation = useNavigation();
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load conditions when component mounts or comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadConditions();
    }, [])
  );

  const loadConditions = async () => {
    try {
      setLoading(true);
      const conditionData = await HealthDataService.getConditions();
      setConditions(conditionData || []);
    } catch (error) {
      console.error('Error loading conditions:', error);
      Alert.alert('Error', 'Failed to load conditions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadConditions();
    setRefreshing(false);
  };

  const handleAddCondition = () => {
    navigation.navigate('AddCondition');
  };

  const handleConditionPress = (condition) => {
    // Format questionnaire answers for display
    const answersText = condition.questionnaireAnswers 
      ? Object.entries(condition.questionnaireAnswers)
          .map(([question, answer]) => `${question}: ${answer}`)
          .join('\n\n')
      : 'No questionnaire data available';

    Alert.alert(
      condition.name,
      `Type: ${condition.type}\nSeverity: ${condition.severity}\nStatus: ${condition.status}\n\nDescription: ${condition.description}\n\nQuestionnaire Responses:\n${answersText}`,
      [
        { text: 'View Details', onPress: () => {/* TODO: Navigate to detail view */ }},
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case CONDITION_STATUS.ACTIVE: return '#F44336';
      case CONDITION_STATUS.RESOLVED: return '#4CAF50';
      case CONDITION_STATUS.MANAGED: return '#2196F3';
      default: return '#666';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'mild': return '#4CAF50';
      case 'moderate': return '#FF9800';
      case 'severe': return '#F44336';
      default: return '#666';
    }
  };

  const renderConditionItem = (condition) => (
    <TouchableOpacity
      key={condition.id}
      style={styles.conditionCard}
      onPress={() => handleConditionPress(condition)}
    >
      <View style={styles.conditionHeader}>
        <View style={styles.conditionMainInfo}>
          <Text style={styles.conditionName}>{condition.name}</Text>
          <Text style={styles.conditionType}>{condition.type}</Text>
        </View>
        <View style={styles.badges}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(condition.status) }]}>
            <Text style={styles.statusText}>{condition.status}</Text>
          </View>
          {condition.severity && (
            <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(condition.severity) }]}>
              <Text style={styles.severityText}>{condition.severity}</Text>
            </View>
          )}
        </View>
      </View>
      
      {condition.description && (
        <Text style={styles.conditionDescription} numberOfLines={2}>
          {condition.description}
        </Text>
      )}

      <View style={styles.conditionDetails}>
        {condition.symptoms && condition.symptoms.length > 0 && (
          <Text style={styles.detailText}>
            Symptoms: {Array.isArray(condition.symptoms) 
              ? condition.symptoms.join(', ') 
              : condition.symptoms}
          </Text>
        )}
        {condition.triggers && condition.triggers.length > 0 && (
          <Text style={styles.detailText}>
            Triggers: {Array.isArray(condition.triggers) 
              ? condition.triggers.join(', ') 
              : condition.triggers}
          </Text>
        )}
        {condition.medications && condition.medications.length > 0 && (
          <Text style={styles.detailText}>
            Medications: {Array.isArray(condition.medications) 
              ? condition.medications.join(', ') 
              : condition.medications}
          </Text>
        )}
      </View>

      {condition.diagnosedDate && (
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            Diagnosed: {formatDate(condition.diagnosedDate)}
          </Text>
          {condition.doctorName && (
            <Text style={styles.dateText}>
              Dr. {condition.doctorName}
            </Text>
          )}
        </View>
      )}

      {condition.questionnaireAnswers && Object.keys(condition.questionnaireAnswers).length > 0 && (
        <Text style={styles.questionnaireText}>
          📋 {Object.keys(condition.questionnaireAnswers).length} questionnaire response{Object.keys(condition.questionnaireAnswers).length !== 1 ? 's' : ''}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>🏥</Text>
      <Text style={styles.heading}>Manage your condition</Text>
      <Text style={styles.subtitle}>
        You're currently not managing any condition. Click{'\n'}
        'Manage condition' to get started
      </Text>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={handleAddCondition}
      >
        <Text style={styles.addButtonText}>+ Manage condition</Text>
      </TouchableOpacity>
    </View>
  );

  const renderConditionsList = () => (
    <View style={styles.conditionsListContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.conditionsCount}>
          {conditions.length} condition{conditions.length !== 1 ? 's' : ''} managed
        </Text>
        <TouchableOpacity 
          style={styles.addButtonSmall}
          onPress={handleAddCondition}
        >
          <Text style={styles.addButtonSmallText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {conditions.map(renderConditionItem)}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <Text style={styles.title}>Condition management</Text>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading your conditions...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Condition management</Text>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {conditions.length === 0 ? renderEmptyState() : renderConditionsList()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  conditionsListContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  conditionsCount: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  addButtonSmall: {
    backgroundColor: '#6200ee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  addButtonSmallText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  conditionCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  conditionMainInfo: {
    flex: 1,
  },
  conditionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  conditionType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  badges: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  conditionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  conditionDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  dateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  questionnaireText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default ConditionManagement; 