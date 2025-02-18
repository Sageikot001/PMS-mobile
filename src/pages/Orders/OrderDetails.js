import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderDetails = ({ route }) => {
  const { order } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order ID: {order.id}</Text>
      <Text style={styles.status}>Status: {order.status}</Text>
      <Text style={styles.subtitle}>Items:</Text>
      {order.items.map(item => (
        <Text key={item.id} style={styles.item}>
          {item.name} (x{item.quantity})
        </Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    marginVertical: 8,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 16,
  },
  item: {
    fontSize: 16,
    marginVertical: 4,
  },
});

export default OrderDetails; 