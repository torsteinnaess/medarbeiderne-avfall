import { Button, Card, StepIndicator } from "@/components/ui";
import { useOrder } from "@/lib/api/hooks";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Separator, Spinner, Text, View, XStack, YStack } from "tamagui";

function formatKr(amount: number): string {
  return `kr ${amount.toLocaleString("nb-NO", { minimumFractionDigits: 0 })},-`;
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
      <StepIndicator currentStep={5} />
      <YStack
        flex={1}
        padding="$xl"
        alignItems="center"
        justifyContent="center"
        gap="$lg"
        maxWidth={600}
        width="100%"
        alignSelf="center"
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

        {order && (isPaid || !order_id) && (
          <Card gap="$md" width="100%" marginTop="$md">
            <Text fontSize={16} fontWeight="600" color="$textPrimary">
              Ordredetaljer
            </Text>

            <XStack justifyContent="space-between">
              <Text fontSize={14} color="$textSecondary">
                Ordre-ID
              </Text>
              <Text fontSize={14} color="$textPrimary" fontFamily="$mono">
                {order.id.substring(0, 8)}
              </Text>
            </XStack>

            <XStack justifyContent="space-between">
              <Text fontSize={14} color="$textSecondary">
                Adresse
              </Text>
              <Text
                fontSize={14}
                color="$textPrimary"
                textAlign="right"
                flex={1}
                marginLeft="$md"
              >
                {order.pickup_address}
              </Text>
            </XStack>

            <XStack justifyContent="space-between">
              <Text fontSize={14} color="$textSecondary">
                Dato
              </Text>
              <Text fontSize={14} color="$textPrimary">
                {formatDateDisplay(order.pickup_date)}
              </Text>
            </XStack>

            <XStack justifyContent="space-between">
              <Text fontSize={14} color="$textSecondary">
                Tidspunkt
              </Text>
              <Text fontSize={14} color="$textPrimary">
                {order.pickup_time_window}
              </Text>
            </XStack>

            <Separator marginVertical="$sm" />

            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={16} fontWeight="700" color="$textPrimary">
                Totalt
              </Text>
              <Text fontSize={18} fontWeight="700" color="$primary">
                {formatKr(order.total_price)}
              </Text>
            </XStack>
          </Card>
        )}

        <YStack gap="$md" width="100%" marginTop="$xl">
          <Button
            variant="primary"
            size="$md"
            fullWidth
            onPress={() => router.replace("/(tabs)/orders")}
          >
            Se mine bestillinger
          </Button>
          <Button
            variant="outline"
            size="$md"
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
