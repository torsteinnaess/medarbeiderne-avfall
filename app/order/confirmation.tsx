import { Button, StepIndicator } from "@/components/ui";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View, YStack } from "tamagui";

export default function ConfirmationScreen() {
  const router = useRouter();
  const reset = useOrderDraftStore((s) => s.reset);

  useEffect(() => {
    reset();
  }, []);

  return (
    <YStack flex={1} backgroundColor="$background">
      <StepIndicator currentStep={6} />
      <YStack
        flex={1}
        padding="$xl"
        alignItems="center"
        justifyContent="center"
        gap="$lg"
      >
        <View
          width={80}
          height={80}
          borderRadius="$full"
          backgroundColor="$successLight"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </View>
        <Text fontSize={22} fontWeight="700" color="$textPrimary">
          Bestilling bekreftet!
        </Text>
        <Text fontSize={14} color="$textSecondary" textAlign="center">
          Du vil motta bekreftelse på e-post.
        </Text>

        <YStack gap="$md" width="100%" marginTop="$xl">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onPress={() => router.replace("/(tabs)/orders")}
          >
            Se mine bestillinger
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            onPress={() => router.replace("/(tabs)")}
          >
            Tilbake til forsiden
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
