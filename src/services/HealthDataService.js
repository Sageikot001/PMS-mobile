import ApiService from './ApiService';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from './AuthService';

// Storage keys for development mode
const HEALTH_METRICS_KEY = '@health_metrics';
const MEDICATIONS_KEY = '@medications';
const CONDITIONS_KEY = '@conditions';
const WELLNESS_CALCULATIONS_KEY = '@wellness_calculations';
const HEALTH_HISTORY_KEY = '@health_history';

// Health data types
export const HEALTH_METRIC_TYPES = {
  WEIGHT: 'weight',
  HEIGHT: 'height',
  BLOOD_PRESSURE: 'bp',
  BMI: 'bodymass',
  BODY_FAT: 'bodyfat',
  BODY_WATER: 'bodywater',
  MUSCLE_MASS: 'musclemass',
  HEART_RATE: 'heartrate',
  TEMPERATURE: 'temperature',
  BLOOD_SUGAR: 'bloodsugar',
  CHOLESTEROL: 'cholesterol',
  SLEEP_HOURS: 'sleep',
};

export const WELLNESS_CALCULATION_TYPES = {
  BMI: 'bmi',
  CALORIE: 'calorie',
  OVULATION: 'ovulation',
};

export const MEDICATION_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
  DISCONTINUED: 'discontinued',
};

export const CONDITION_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  MANAGED: 'managed',
};

/**
 * Health Data Service
 * Handles all health-related data operations
 */
class HealthDataService {
  
  // ===============================
  // HEALTH METRICS OPERATIONS
  // ===============================
  
  /**
   * Get all health metrics for the current user
   * @returns {Promise<Object>} Health metrics data
   */
  async getHealthMetrics() {
    try {
      if (isDevelopment()) {
        const storedMetrics = await AsyncStorage.getItem(HEALTH_METRICS_KEY);
        return storedMetrics ? JSON.parse(storedMetrics) : this.getDefaultMetrics();
      }
      
      const response = await ApiService.get(ENDPOINTS.HEALTH.GET_METRICS);
      return response.data || this.getDefaultMetrics();
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      return this.getDefaultMetrics();
    }
  }
  
  /**
   * Add or update a health metric
   * @param {string} metricType - Type of metric (weight, height, etc.)
   * @param {Object} metricData - Metric data including value, date, notes
   * @returns {Promise<Object>} Updated metric data
   */
  async addHealthMetric(metricType, metricData) {
    try {
      const user = await getCurrentUser();
      const entry = {
        id: `${metricType}_${Date.now()}`,
        userId: user._id,
        type: metricType,
        value: metricData.value,
        unit: metricData.unit,
        date: metricData.date || new Date().toISOString(),
        notes: metricData.notes || '',
        source: metricData.source || 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (isDevelopment()) {
        // Store in local storage for development
        const currentMetrics = await this.getHealthMetrics();
        
        // Initialize the metric type array if it doesn't exist
        if (!currentMetrics[metricType]) {
          currentMetrics[metricType] = {
            current: null,
            history: [],
            lastUpdated: null,
          };
        }
        
        // Add to history
        currentMetrics[metricType].history.unshift(entry);
        
        // Update current value
        currentMetrics[metricType].current = entry;
        currentMetrics[metricType].lastUpdated = entry.date;
        
        // Calculate BMI if height and weight are available
        if (metricType === HEALTH_METRIC_TYPES.WEIGHT || metricType === HEALTH_METRIC_TYPES.HEIGHT) {
          await this.calculateAndStoreBMI(currentMetrics);
        }
        
        await AsyncStorage.setItem(HEALTH_METRICS_KEY, JSON.stringify(currentMetrics));
        
        // Store in history
        await this.addToHealthHistory('health_metric', entry);
        
        console.log('✅ Health metric saved locally:', metricType, metricData.value);
        return entry;
      }
      
      // In production, call the real API
      const response = await ApiService.post(ENDPOINTS.HEALTH.ADD_METRIC, entry);
      return response.data;
    } catch (error) {
      console.error('Error adding health metric:', error);
      throw error;
    }
  }
  
  /**
   * Get health metric history for a specific type
   * @param {string} metricType - Type of metric
   * @param {number} limit - Maximum number of entries to return
   * @returns {Promise<Array>} Metric history entries
   */
  async getMetricHistory(metricType, limit = 50) {
    try {
      const metrics = await this.getHealthMetrics();
      const metricData = metrics[metricType];
      
      if (!metricData || !metricData.history) {
        return [];
      }
      
      return metricData.history
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching metric history:', error);
      return [];
    }
  }
  
  /**
   * Calculate and store BMI based on current height and weight
   * @param {Object} metrics - Current health metrics
   */
  async calculateAndStoreBMI(metrics = null) {
    try {
      if (!metrics) {
        metrics = await this.getHealthMetrics();
      }
      
      const weight = metrics[HEALTH_METRIC_TYPES.WEIGHT]?.current;
      const height = metrics[HEALTH_METRIC_TYPES.HEIGHT]?.current;
      
      if (weight && height) {
        const weightKg = parseFloat(weight.value);
        const heightCm = parseFloat(height.value);
        const heightM = heightCm / 100;
        
        const bmi = (weightKg / (heightM * heightM)).toFixed(1);
        
        // Determine BMI category
        let category = '';
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal weight';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';
        
        const bmiData = {
          value: bmi,
          unit: 'kg/m²',
          category: category,
          source: 'calculated',
          calculatedFrom: {
            weight: weight.value,
            height: height.value,
            weightDate: weight.date,
            heightDate: height.date,
          },
        };
        
        await this.addHealthMetric(HEALTH_METRIC_TYPES.BMI, bmiData);
        console.log('✅ BMI calculated and stored:', bmi, category);
      }
    } catch (error) {
      console.error('Error calculating BMI:', error);
    }
  }
  
  /**
   * Get default health metrics structure
   */
  getDefaultMetrics() {
    const defaultStructure = {};
    Object.values(HEALTH_METRIC_TYPES).forEach(type => {
      defaultStructure[type] = {
        current: null,
        history: [],
        lastUpdated: null,
      };
    });
    return defaultStructure;
  }
  
  // ===============================
  // MEDICATION MANAGEMENT
  // ===============================
  
  /**
   * Get all medications for the current user
   * @returns {Promise<Array>} List of medications
   */
  async getMedications() {
    try {
      if (isDevelopment()) {
        const storedMedications = await AsyncStorage.getItem(MEDICATIONS_KEY);
        return storedMedications ? JSON.parse(storedMedications) : [];
      }
      
      const response = await ApiService.get(ENDPOINTS.HEALTH.MEDICATIONS);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching medications:', error);
      return [];
    }
  }
  
  /**
   * Add a new medication
   * @param {Object} medicationData - Medication information
   * @returns {Promise<Object>} Added medication
   */
  async addMedication(medicationData) {
    try {
      const user = await getCurrentUser();
      const medication = {
        id: `med_${Date.now()}`,
        userId: user._id,
        name: medicationData.name,
        brand: medicationData.brand || '',
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        dosageTimes: medicationData.dosageTimes || [],
        startDate: medicationData.startDate,
        endDate: medicationData.endDate,
        instructions: medicationData.instructions || '',
        prescribedBy: medicationData.prescribedBy || '',
        purpose: medicationData.purpose || '',
        sideEffects: medicationData.sideEffects || '',
        reminderEnabled: medicationData.reminderEnabled || false,
        status: MEDICATION_STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (isDevelopment()) {
        const currentMedications = await this.getMedications();
        currentMedications.push(medication);
        await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(currentMedications));
        
        // Store in history
        await this.addToHealthHistory('medication_added', medication);
        
        console.log('✅ Medication saved locally:', medication.name);
        return medication;
      }
      
      const response = await ApiService.post(ENDPOINTS.HEALTH.MEDICATIONS, medication);
      return response.data;
    } catch (error) {
      console.error('Error adding medication:', error);
      throw error;
    }
  }
  
  /**
   * Update medication status
   * @param {string} medicationId - Medication ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated medication
   */
  async updateMedicationStatus(medicationId, status) {
    try {
      if (isDevelopment()) {
        const medications = await this.getMedications();
        const medicationIndex = medications.findIndex(med => med.id === medicationId);
        
        if (medicationIndex !== -1) {
          medications[medicationIndex].status = status;
          medications[medicationIndex].updatedAt = new Date().toISOString();
          
          await AsyncStorage.setItem(MEDICATIONS_KEY, JSON.stringify(medications));
          
          // Store in history
          await this.addToHealthHistory('medication_updated', {
            medicationId,
            status,
            medicationName: medications[medicationIndex].name,
          });
          
          return medications[medicationIndex];
        }
        throw new Error('Medication not found');
      }
      
      const response = await ApiService.put(`${ENDPOINTS.HEALTH.MEDICATIONS}/${medicationId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating medication status:', error);
      throw error;
    }
  }
  
  // ===============================
  // CONDITION MANAGEMENT
  // ===============================
  
  /**
   * Get all health conditions for the current user
   * @returns {Promise<Array>} List of conditions
   */
  async getConditions() {
    try {
      if (isDevelopment()) {
        const storedConditions = await AsyncStorage.getItem(CONDITIONS_KEY);
        return storedConditions ? JSON.parse(storedConditions) : [];
      }
      
      const response = await ApiService.get(ENDPOINTS.HEALTH.CONDITIONS);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching conditions:', error);
      return [];
    }
  }
  
  /**
   * Add a new health condition
   * @param {Object} conditionData - Condition information
   * @returns {Promise<Object>} Added condition
   */
  async addCondition(conditionData) {
    try {
      const user = await getCurrentUser();
      const condition = {
        id: `cond_${Date.now()}`,
        userId: user._id,
        name: conditionData.name,
        type: conditionData.type,
        description: conditionData.description,
        diagnosedDate: conditionData.diagnosedDate,
        severity: conditionData.severity || 'moderate',
        symptoms: conditionData.symptoms || [],
        triggers: conditionData.triggers || [],
        medications: conditionData.medications || [],
        doctorName: conditionData.doctorName || '',
        treatment: conditionData.treatment || '',
        notes: conditionData.notes || '',
        status: CONDITION_STATUS.ACTIVE,
        questionnaireAnswers: conditionData.answers || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      if (isDevelopment()) {
        const currentConditions = await this.getConditions();
        currentConditions.push(condition);
        await AsyncStorage.setItem(CONDITIONS_KEY, JSON.stringify(currentConditions));
        
        // Store in history
        await this.addToHealthHistory('condition_added', condition);
        
        console.log('✅ Condition saved locally:', condition.name);
        return condition;
      }
      
      const response = await ApiService.post(ENDPOINTS.HEALTH.CONDITIONS, condition);
      return response.data;
    } catch (error) {
      console.error('Error adding condition:', error);
      throw error;
    }
  }
  
  // ===============================
  // WELLNESS CALCULATIONS
  // ===============================
  
  /**
   * Save wellness calculation results
   * @param {string} calculationType - Type of calculation (bmi, calorie, ovulation)
   * @param {Object} calculationData - Calculation input and results
   * @returns {Promise<Object>} Saved calculation
   */
  async saveWellnessCalculation(calculationType, calculationData) {
    try {
      const user = await getCurrentUser();
      const calculation = {
        id: `calc_${calculationType}_${Date.now()}`,
        userId: user._id,
        type: calculationType,
        inputData: calculationData.input,
        results: calculationData.results,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      
      if (isDevelopment()) {
        const storedCalculations = await AsyncStorage.getItem(WELLNESS_CALCULATIONS_KEY);
        const calculations = storedCalculations ? JSON.parse(storedCalculations) : [];
        calculations.unshift(calculation);
        
        // Keep only last 100 calculations
        if (calculations.length > 100) {
          calculations.splice(100);
        }
        
        await AsyncStorage.setItem(WELLNESS_CALCULATIONS_KEY, JSON.stringify(calculations));
        
        // If it's a BMI calculation, also store the height and weight as health metrics
        if (calculationType === WELLNESS_CALCULATION_TYPES.BMI) {
          const { weight, height } = calculationData.input;
          const { bmi, category } = calculationData.results;
          
          if (weight) {
            await this.addHealthMetric(HEALTH_METRIC_TYPES.WEIGHT, {
              value: weight,
              unit: calculationData.input.weightUnit || 'kg',
              source: 'bmi_calculator',
            });
          }
          
          if (height) {
            await this.addHealthMetric(HEALTH_METRIC_TYPES.HEIGHT, {
              value: height,
              unit: calculationData.input.heightUnit || 'cm',
              source: 'bmi_calculator',
            });
          }
          
          await this.addHealthMetric(HEALTH_METRIC_TYPES.BMI, {
            value: bmi,
            unit: 'kg/m²',
            category: category,
            source: 'bmi_calculator',
          });
        }
        
        // Store in history
        await this.addToHealthHistory('wellness_calculation', calculation);
        
        console.log('✅ Wellness calculation saved:', calculationType);
        return calculation;
      }
      
      // In production, save to backend
      const response = await ApiService.post('/health/wellness-calculations', calculation);
      return response.data;
    } catch (error) {
      console.error('Error saving wellness calculation:', error);
      throw error;
    }
  }
  
  /**
   * Get wellness calculation history
   * @param {string} calculationType - Type of calculation (optional)
   * @param {number} limit - Maximum number of entries
   * @returns {Promise<Array>} Calculation history
   */
  async getWellnessCalculationHistory(calculationType = null, limit = 20) {
    try {
      if (isDevelopment()) {
        const storedCalculations = await AsyncStorage.getItem(WELLNESS_CALCULATIONS_KEY);
        let calculations = storedCalculations ? JSON.parse(storedCalculations) : [];
        
        if (calculationType) {
          calculations = calculations.filter(calc => calc.type === calculationType);
        }
        
        return calculations
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, limit);
      }
      
      const response = await ApiService.get('/health/wellness-calculations', {
        type: calculationType,
        limit,
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching wellness calculation history:', error);
      return [];
    }
  }
  
  // ===============================
  // HEALTH HISTORY & ANALYTICS
  // ===============================
  
  /**
   * Add entry to general health history
   * @param {string} type - Type of activity
   * @param {Object} data - Activity data
   */
  async addToHealthHistory(type, data) {
    try {
      const historyEntry = {
        id: `history_${Date.now()}`,
        type,
        data,
        timestamp: new Date().toISOString(),
      };
      
      if (isDevelopment()) {
        const storedHistory = await AsyncStorage.getItem(HEALTH_HISTORY_KEY);
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        history.unshift(historyEntry);
        
        // Keep only last 500 entries
        if (history.length > 500) {
          history.splice(500);
        }
        
        await AsyncStorage.setItem(HEALTH_HISTORY_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error adding to health history:', error);
    }
  }
  
  /**
   * Get health analytics summary
   * @returns {Promise<Object>} Health analytics data
   */
  async getHealthAnalytics() {
    try {
      const [metrics, medications, conditions, calculations] = await Promise.all([
        this.getHealthMetrics(),
        this.getMedications(),
        this.getConditions(),
        this.getWellnessCalculationHistory(),
      ]);
      
      // Calculate trends and summaries
      const analytics = {
        summary: {
          totalMetrics: Object.keys(metrics).length,
          activeMedications: medications.filter(med => med.status === MEDICATION_STATUS.ACTIVE).length,
          activeConditions: conditions.filter(cond => cond.status === CONDITION_STATUS.ACTIVE).length,
          recentCalculations: calculations.length,
        },
        recentActivity: await this.getRecentHealthActivity(),
        trends: this.calculateHealthTrends(metrics),
        lastUpdated: new Date().toISOString(),
      };
      
      return analytics;
    } catch (error) {
      console.error('Error fetching health analytics:', error);
      return {
        summary: { totalMetrics: 0, activeMedications: 0, activeConditions: 0, recentCalculations: 0 },
        recentActivity: [],
        trends: {},
        lastUpdated: new Date().toISOString(),
      };
    }
  }
  
  /**
   * Get recent health activity
   * @param {number} limit - Number of recent activities
   * @returns {Promise<Array>} Recent health activities
   */
  async getRecentHealthActivity(limit = 10) {
    try {
      if (isDevelopment()) {
        const storedHistory = await AsyncStorage.getItem(HEALTH_HISTORY_KEY);
        const history = storedHistory ? JSON.parse(storedHistory) : [];
        return history.slice(0, limit);
      }
      
      const response = await ApiService.get('/health/recent-activity', { limit });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent health activity:', error);
      return [];
    }
  }
  
  /**
   * Calculate health trends from metrics
   * @param {Object} metrics - Health metrics data
   * @returns {Object} Trends analysis
   */
  calculateHealthTrends(metrics) {
    const trends = {};
    
    Object.entries(metrics).forEach(([metricType, metricData]) => {
      if (metricData.history && metricData.history.length > 1) {
        const recentEntries = metricData.history
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 10);
          
        if (recentEntries.length >= 2) {
          const latest = parseFloat(recentEntries[0].value);
          const previous = parseFloat(recentEntries[1].value);
          const change = latest - previous;
          const percentChange = ((change / previous) * 100).toFixed(1);
          
          trends[metricType] = {
            direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
            change: change,
            percentChange: percentChange,
            latestValue: latest,
            previousValue: previous,
            lastUpdated: recentEntries[0].date,
          };
        }
      }
    });
    
    return trends;
  }
  
  // ===============================
  // DATA EXPORT & BACKUP
  // ===============================
  
  /**
   * Export all health data
   * @returns {Promise<Object>} Complete health data export
   */
  async exportHealthData() {
    try {
      const [metrics, medications, conditions, calculations] = await Promise.all([
        this.getHealthMetrics(),
        this.getMedications(),
        this.getConditions(),
        this.getWellnessCalculationHistory(null, 1000),
      ]);
      
      const user = await getCurrentUser();
      
      return {
        exportDate: new Date().toISOString(),
        userId: user._id,
        userName: user.name || user.email,
        data: {
          healthMetrics: metrics,
          medications: medications,
          conditions: conditions,
          wellnessCalculations: calculations,
        },
        summary: await this.getHealthAnalytics(),
      };
    } catch (error) {
      console.error('Error exporting health data:', error);
      throw error;
    }
  }
  
  /**
   * Clear all health data (development only)
   */
  async clearAllHealthData() {
    if (!isDevelopment()) {
      throw new Error('Data clearing is only available in development mode');
    }
    
    try {
      await AsyncStorage.multiRemove([
        HEALTH_METRICS_KEY,
        MEDICATIONS_KEY,
        CONDITIONS_KEY,
        WELLNESS_CALCULATIONS_KEY,
        HEALTH_HISTORY_KEY,
      ]);
      console.log('✅ All health data cleared');
    } catch (error) {
      console.error('Error clearing health data:', error);
      throw error;
    }
  }
}

export default new HealthDataService(); 