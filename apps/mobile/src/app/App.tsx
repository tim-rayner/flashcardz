import { StyleSheet, Text, View } from 'react-native';

export const App = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text} testID="heading">
        Hello World
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 24,
  },
});

export default App;
