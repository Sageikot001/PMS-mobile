import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ServiceCard = ({ title, icon, style, onPress }) => (
  <TouchableOpacity style={[styles.serviceCard, style]} onPress={onPress}>
    <Ionicons name={icon} size={32} color="#444" />
    <Text style={styles.serviceTitle}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  serviceCard: {
    width: 120,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default ServiceCard;
