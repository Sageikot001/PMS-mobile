import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const ActivityLevelSelector = ({ value, onChange }) => {
  const activityLevels = [
    {
      id: 'bmr',
      title: 'Basic metabolic rate(BMR)',
      description: 'Minimal movement, mostly resting'
    },
    {
      id: 'sedentary',
      title: 'Sedentary (Little or no exercise)',
      description: 'Office job, minimal activity'
    },
    {
      id: 'light',
      title: 'Light (Exercise 1-3 times/week)',
      description: 'Light exercise or sports'
    },
    {
      id: 'moderate',
      title: 'Moderate (Exercise 4-5 times/week)',
      description: 'Moderate exercise or sports'
    },
    {
      id: 'active',
      title: 'Active (Daily Exercise 4-5 times/week)',
      description: 'Daily exercise or intense sports'
    },
    {
      id: 'very_active',
      title: 'Very Active (Intense Exercise 6-7 times/week)',
      description: 'Hard exercise or sports'
    },
    {
      id: 'extra_active',
      title: 'Extra active (Very intense exercise)',
      description: 'Very hard exercise/sports & physical job'
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {activityLevels.map((level) => (
        <TouchableOpacity
          key={level.id}
          style={[
            styles.activityButton,
            value === level.id && styles.selectedActivity
          ]}
          onPress={() => onChange(level.id)}
        >
          <Text style={styles.activityTitle}>{level.title}</Text>
        </TouchableOpacity>
      ))}
      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 32,
  },
  activityButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedActivity: {
    backgroundColor: '#6200ee',
  },
  activityTitle: {
    fontSize: 16,
    color: '#333',
  },
  bottomSpace: {
    height: 100,
  },
});

export default ActivityLevelSelector; 