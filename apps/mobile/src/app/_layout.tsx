import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { theme } from '../theme/theme';
import { getStorage } from '../utils/storage/local-db';

type SchemaState = 'loading' | 'ready' | 'error';

export default function RootLayout() {
  const [schemaState, setSchemaState] = useState<SchemaState>('loading');

  useEffect(() => {
    getStorage()
      .then(() => setSchemaState('ready'))
      .catch(() => setSchemaState('error'));
  }, []);

  if (schemaState === 'loading') {
    return <View style={styles.container} />;
  }

  if (schemaState === 'error') {
    return (
      <View style={styles.container} testID="schema-error-screen">
        <Text style={styles.errorHeading}>Something went wrong</Text>
        <Text style={styles.errorBody}>
          Your data couldn&apos;t be loaded. Try restarting the app.
        </Text>
      </View>
    );
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  errorHeading: {
    fontSize: theme.typography.h1.fontSize,
    lineHeight: theme.typography.h1.lineHeight,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.neutral[800],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  errorBody: {
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    fontWeight: theme.typography.body.fontWeight,
    color: theme.colors.neutral[600],
    textAlign: 'center',
  },
});
