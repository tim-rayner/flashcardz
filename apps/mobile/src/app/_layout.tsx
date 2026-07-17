import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '../theme/theme';
import { getStorage } from '../utils/storage/local-db';

export default function RootLayout() {
  const [isSchemaReady, setSchemaReady] = useState(false);

  useEffect(() => {
    getStorage().then(() => setSchemaReady(true));
  }, []);

  if (!isSchemaReady) {
    return <View style={styles.container} />;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.neutral[50] },
        headerTintColor: theme.colors.neutral[800],
        headerShadowVisible: false,
        headerBackTitle: '',
        contentStyle: { backgroundColor: theme.colors.neutral[50] },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="topics/[id]/(tabs)" options={{ title: '' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.neutral[50],
  },
});
