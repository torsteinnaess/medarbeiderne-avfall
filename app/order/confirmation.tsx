import { Button, StepIndicator } from "@/components/ui";
import { useOrder } from "@/lib/api/hooks";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Spinner, Text, View, YStack } from "tamagui";

export default function ConfirmationScreen() {
  const router = useRouter();
  const reset = useOrderDraftStore((s) => s.reset);
  const { order_id } = useLocalSearchParams<{ order_id?: string }>();

  // Poll ordre for å sjekke betalingsstatus
  const { data: order, isLoading, refetch } = useOrder(order_id ?? "");

  useEffect(() => {
    reset();
  }, []);

  const isPaid =
    order?.payment_status === "paid" || order?.payment_status === "authorized";
  const isWaiting = !isPaid && !isLoading && !!order_id;
  useEffect(() => {
    if (!order_id || isPaid) return;
    const interval = setInterval(() => {
      refetch();
    }, 3000);
    return () => clearInterval(interval);
  }, [order_id, isPaid, refetch]);

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
        {isLoading && (
          <>
            <Spinner size="large" color="$primary" />
            <Text fontSize={16} color="$textSecondary">
              Sjekker betalingsstatus...
            </Text>
          </>
        )}

        {isWaiting && (
          <>
            <Spinner size="large" color="$primary" />
            <Text fontSize={18} fontWeight="600" color="$textPrimary">
              Venter på betaling...
            </Text>
            <Text fontSize={14} color="$textSecondary" textAlign="center">
              Betalingen din behandles. Dette tar vanligvis bare noen sekunder.
            </Text>
          </>
        )}

        {(isPaid || !order_id) && (
          <>
            <View
              width={80}
              height={80}
              borderRadius="$full"
              backgroundColor="$successLight"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.success}
              />
            </View>
            <Text fontSize={22} fontWeight="700" color="$textPrimary">
              {isPaid ? "Betaling mottatt!" : "Bestilling bekreftet!"}
            </Text>
            <Text fontSize={14} color="$textSecondary" textAlign="center">
              Du vil motta bekreftelse på e-post.
            </Text>
          </>
        )}

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
