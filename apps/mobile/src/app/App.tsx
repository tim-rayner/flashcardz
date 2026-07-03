import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HomeScreen } from '../features/home/HomeScreen';
import { theme } from '../theme/theme';
import { initSchema } from '../utils/storage/schema';

export const App = () => {
  const [isSchemaReady, setSchemaReady] = useState(false);

  useEffect(() => {
    initSchema().then(() => setSchemaReady(true));
  }, []);

  if (!isSchemaReady) {
    return <View style={styles.container} />;
  }

  return <HomeScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
});

export default App;
