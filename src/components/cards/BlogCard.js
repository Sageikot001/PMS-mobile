import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BlogCard = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContent}>
          <Text style={styles.title}>Latest from the Blog</Text>
          <Text style={styles.description}>
            Get updated and informed with right informaton for your health
          </Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Read articles</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* <Image
          source={('../../assets/blog-illustration.png')} // You'll need to add this image
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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

export default BlogCard; 