import { useLocalSearchParams } from 'expo-router';
import { Text, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/theme';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <YStack flex={1} backgroundColor="$background" padding="$xl" alignItems="center" justifyContent="center" gap="$lg">
      <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
      <Text fontSize={18} fontWeight="600" color="$textPrimary">
        Ordre #{id}
      </Text>
      <Text fontSize={14} color="$textSecondary" textAlign="center">
        Ordredetaljer — bygges av Stream 6 (My Account & Orders)
      </Text>
    </YStack>
  );
}

