import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Location</Text>
      
      
    </View>
  );
}

//temporary 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', 
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#828282', 
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#AFC6A3', 
    padding: 15,
    borderRadius: 25,
    width: '75%',
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3, //for android shadows, test?
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});