import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for recent health activities
const RECENT_ACTIVITIES_KEY = '@recent_health_activities';

// Activity types
export const ACTIVITY_TYPES = {
  HEALTH_METRIC: 'health_metric',
  WELLNESS_CALC: 'wellness_calc',
  MEDICATION: 'medication',
  CONDITION: 'condition',
  CONSULTATION: 'consultation',
};

/**
 * Health Activity Tracking Service
 * Tracks user's recently visited health features for Quick Actions
 */
class HealthActivityService {
  
  /**
   * Record a health activity
   * @param {string} type - Activity type from ACTIVITY_TYPES
   * @param {string} screen - Screen name navigated to
   * @param {Object} metadata - Additional metadata about the activity
   */
  async recordActivity(type, screen, metadata = {}) {
    try {
      const activity = {
        id: `${type}_${Date.now()}`,
        type,
        screen,
        metadata,
        timestamp: new Date().toISOString(),
      };

      const stored = await AsyncStorage.getItem(RECENT_ACTIVITIES_KEY);
      const activities = stored ? JSON.parse(stored) : [];
      
      // Remove any existing activity for the same screen to avoid duplicates
      const filteredActivities = activities.filter(act => act.screen !== screen);
      
      // Add new activity at the beginning
      filteredActivities.unshift(activity);
      
      // Keep only the last 10 activities
      const limitedActivities = filteredActivities.slice(0, 10);
      
      await AsyncStorage.setItem(RECENT_ACTIVITIES_KEY, JSON.stringify(limitedActivities));
      
      console.log('✅ Health activity recorded:', type, screen);
    } catch (error) {
      console.error('Error recording health activity:', error);
    }
  }

  /**
   * Get recent health activities for Quick Actions
   * @param {number} limit - Number of activities to return (default: 4)
   * @returns {Promise<Array>} Recent activities
   */
  async getRecentActivities(limit = 4) {
    try {
      const stored = await AsyncStorage.getItem(RECENT_ACTIVITIES_KEY);
      const activities = stored ? JSON.parse(stored) : [];
      
      // Filter and transform activities into quick action format
      const quickActions = activities
        .slice(0, limit)
        .map(activity => this.activityToQuickAction(activity))
        .filter(action => action !== null);
        
      return quickActions;
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  /**
   * Transform activity into quick action format
   * @param {Object} activity - Activity object
   * @returns {Object|null} Quick action object or null if not suitable
   */
  activityToQuickAction(activity) {
    const { type, screen, metadata } = activity;
    
    switch (type) {
      case ACTIVITY_TYPES.HEALTH_METRIC:
        return {
          id: `recent_${activity.id}`,
          icon: this.getMetricIcon(metadata.metricType),
          text: `Log ${metadata.metricName || 'Metric'}`,
          screen: 'HealthMetricDetail',
          params: { metricId: metadata.metricType },
        };
        
      case ACTIVITY_TYPES.WELLNESS_CALC:
        return {
          id: `recent_${activity.id}`,
          icon: this.getWellnessIcon(metadata.calcType),
          text: `${metadata.calcName || 'Calculator'}`,
          screen: screen,
          params: metadata.params || {},
        };
        
      case ACTIVITY_TYPES.MEDICATION:
        return {
          id: `recent_${activity.id}`,
          icon: '💊',
          text: 'Medications',
          screen: 'MedicationManagement',
          params: {},
        };
        
      case ACTIVITY_TYPES.CONDITION:
        return {
          id: `recent_${activity.id}`,
          icon: '🏥',
          text: 'Conditions',
          screen: 'ConditionManagement',
          params: {},
        };
        
      case ACTIVITY_TYPES.CONSULTATION:
        return {
          id: `recent_${activity.id}`,
          icon: '👩‍⚕️',
          text: 'Consultations',
          screen: 'ConsultationHome',
          params: {},
        };
        
      default:
        return null;
    }
  }

  /**
   * Get icon for health metric type
   * @param {string} metricType - Health metric type
   * @returns {string} Emoji icon
   */
  getMetricIcon(metricType) {
    const iconMap = {
      'weight': '⚖️',
      'height': '📏',
      'bp': '❤️',
      'bodymass': '🏋️',
      'bodyfat': '📊',
      'bodywater': '💧',
      'musclemass': '💪',
      'heartrate': '💓',
    };
    return iconMap[metricType] || '📊';
  }

  /**
   * Get icon for wellness calculator type
   * @param {string} calcType - Calculator type
   * @returns {string} Emoji icon
   */
  getWellnessIcon(calcType) {
    const iconMap = {
      'bmi': '🏋️',
      'calorie': '🍎',
      'ovulation': '🌸',
    };
    return iconMap[calcType] || '📊';
  }

  /**
   * Get default quick actions when no recent activities exist
   * @returns {Array} Default quick actions
   */
  getDefaultQuickActions() {
    return [
      {
        id: 'default_weight',
        icon: '⚖️',
        text: 'Log Weight',
        screen: 'HealthMetricDetail',
        params: { metricId: 'weight' },
      },
      {
        id: 'default_bp',
        icon: '❤️',
        text: 'Log BP',
        screen: 'HealthMetricDetail',
        params: { metricId: 'bp' },
      },
      {
        id: 'default_bmi',
        icon: '🏋️',
        text: 'Check BMI',
        screen: 'BMICalculator',
        params: {},
      },
      {
        id: 'default_meds',
        icon: '💊',
        text: 'Add Med',
        screen: 'AddMedication',
        params: {},
      },
    ];
  }

  /**
   * Get quick actions with fallback to defaults
   * @param {number} limit - Number of actions to return
   * @returns {Promise<Array>} Quick actions array
   */
  async getQuickActions(limit = 4) {
    const recentActivities = await this.getRecentActivities(limit);
    
    if (recentActivities.length === 0) {
      return this.getDefaultQuickActions().slice(0, limit);
    }
    
    // Mix recent activities with defaults if we don't have enough recent ones
    if (recentActivities.length < limit) {
      const defaults = this.getDefaultQuickActions();
      const needed = limit - recentActivities.length;
      
      // Filter out defaults that are already in recent activities
      const recentScreens = recentActivities.map(a => a.screen);
      const filteredDefaults = defaults.filter(d => !recentScreens.includes(d.screen));
      
      return [...recentActivities, ...filteredDefaults.slice(0, needed)];
    }
    
    return recentActivities;
  }

  /**
   * Clear all recorded activities (for testing/reset)
   */
  async clearActivities() {
    try {
      await AsyncStorage.removeItem(RECENT_ACTIVITIES_KEY);
      console.log('✅ Health activities cleared');
    } catch (error) {
      console.error('Error clearing activities:', error);
    }
  }
}

export default new HealthActivityService(); 