import { useRouter } from 'expo-router';
import { Text, YStack } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/ui';
import { colors } from '@/lib/theme';

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <YStack flex={1} backgroundColor="$background" padding="$xl" alignItems="center" justifyContent="center" gap="$lg">
      <Ionicons name="receipt-outline" size={64} color={colors.textMuted} />
      <Text fontSize={18} fontWeight="600" color="$textPrimary">
        Ingen bestillinger ennå
      </Text>
      <Text fontSize={14} color="$textSecondary" textAlign="center">
        Når du bestiller en henting, vil den vises her.
      </Text>
      <Button
        variant="primary"
        size="md"
        onPress={() => router.push('/order/upload')}
        marginTop="$md"
      >
        Bestill din første henting
      </Button>
    </YStack>
  );
}

