import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View } from 'react-native';

const HealthCard = ({ id, title, value, unit, icon, trend, onPress }) => {
  const renderTrendIndicator = () => {
    if (!trend) return null;
    
    return (
      <View style={styles.trendContainer}>
        <Text style={styles.trendIcon}>{trend.icon}</Text>
        <Text style={[
          styles.trendText,
          { color: trend.direction === 'up' ? '#4caf50' : trend.direction === 'down' ? '#f44336' : '#666' }
        ]}>
          {trend.change > 0 ? '+' : ''}{trend.change}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress && onPress(id)}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        {renderTrendIndicator()}
      </View>
      <View style={styles.valueContainer}>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: 140,
    marginLeft: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 6,
  },
  icon: {
    fontSize: 20,
  },
  trendContainer: {
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 10,
  },
  trendText: {
    fontSize: 9,
    fontWeight: '600',
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 6,
    flex: 1,
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
    color: '#333',
  },
  unit: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#666',
  },
  title: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default HealthCard; 