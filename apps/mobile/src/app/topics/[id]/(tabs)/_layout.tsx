import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useLocalSearchParams, withLayoutContext } from 'expo-router';
import { theme } from '../../../../theme/theme';
import { TopicTabsLayout } from '../../../../features/topic-detail/TopicTabsLayout';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

export default function TopicTabsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <TopicTabsLayout topicId={id}>
      <MaterialTopTabs
        screenOptions={{
          tabBarActiveTintColor: theme.colors.primaryDark,
          tabBarInactiveTintColor: theme.colors.neutral[400],
          tabBarIndicatorStyle: { backgroundColor: theme.colors.primary },
          tabBarStyle: { backgroundColor: theme.colors.neutral[50] },
          tabBarLabelStyle: {
            fontSize: theme.typography.button.fontSize,
            fontWeight: theme.typography.button.fontWeight,
            textTransform: 'none',
          },
        }}
      >
        <MaterialTopTabs.Screen name="index" options={{ title: 'Cards' }} />
        <MaterialTopTabs.Screen name="performance" options={{ title: 'Performance' }} />
      </MaterialTopTabs>
    </TopicTabsLayout>
  );
}
