import { Stack } from 'expo-router';
import { colors } from '@/lib/theme';

export default function OrderFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerBackTitle: 'Tilbake',
      }}
    >
      <Stack.Screen
        name="upload"
        options={{ title: 'Last opp bilder' }}
      />
      <Stack.Screen
        name="analysis"
        options={{ title: 'Analyse' }}
      />
      <Stack.Screen
        name="pickup-details"
        options={{ title: 'Hentedetaljer' }}
      />
      <Stack.Screen
        name="price"
        options={{ title: 'Prisoversikt' }}
      />
      <Stack.Screen
        name="checkout"
        options={{ title: 'Betaling' }}
      />
      <Stack.Screen
        name="confirmation"
        options={{ title: 'Bekreftelse', headerBackVisible: false }}
      />
    </Stack>
  );
}

