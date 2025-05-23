import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

const EarningsScreen = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.center}>
      <Text style={styles.text}>Earnings - Coming Soon</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#4A90E2', fontWeight: 'bold' },
});

export default EarningsScreen; 