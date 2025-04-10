import { View, Text, StyleSheet } from 'react-native';

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to Pocket Stylist 👗</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d6e2cf', //can change this to better reflect our brand colour (but shud be green)
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'grey',
  },
});
