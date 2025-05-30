import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const ConsultationCard = () => {

  const navigation = useNavigation();
  // const { metricId } = route.params;
  // , { metricId }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.title}>Book a Consultation</Text>
          <Text style={styles.description}>
            Get connected to the right professional for your health
          </Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.navigate('ConsultationHome')}>
            <Text style={styles.buttonText}>Schedule now</Text>
          </TouchableOpacity>
        </View>
        {/* <Image
          source={('../../assets/doctor-illustration.png')} // You'll need to add this image
          style={styles.image}
          resizeMode="contain"
        /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContent: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#7E3AF2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  image: {
    width: 100,
    height: 100,
  },
});

export default ConsultationCard; 