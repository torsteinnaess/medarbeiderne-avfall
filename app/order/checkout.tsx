import { Button, Card, StepIndicator } from "@/components/ui";
import { useCreateOrder } from "@/lib/api/hooks";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    H2,
    ScrollView,
    Separator,
    Spinner,
    Text,
    XStack,
    YStack,
} from "tamagui";

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

export default function CheckoutScreen() {
  const router = useRouter();
  const { analyzedItems, storagePaths, pickupDetails, priceBreakdown, reset } =
    useOrderDraftStore();

  const createOrderMutation = useCreateOrder();
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!pickupDetails || !priceBreakdown) return;
    setError(null);

    createOrderMutation.mutate(
      {
        items: analyzedItems,
        pickup_details: pickupDetails,
        image_storage_paths: storagePaths,
        price_breakdown: priceBreakdown,
      },
      {
        onSuccess: () => {
          reset();
          router.push("/order/confirmation");
        },
        onError: (err) => {
          setError(err.message);
        },
      },
    );
  };

  if (createOrderMutation.isPending) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={5} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$lg">
          <Spinner size="large" color="$primary" />
          <Text fontSize={16} color="$textSecondary">
            Oppretter bestilling...
          </Text>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <StepIndicator currentStep={5} />
      <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 16 }}>
        <H2 color="$textPrimary">Bekreft bestilling</H2>

        <Card gap="$md">
          <Text fontSize={16} fontWeight="600" color="$textPrimary">
            Sammendrag
          </Text>

          <XStack justifyContent="space-between">
            <Text fontSize={14} color="$textSecondary">
              Gjenstander
            </Text>
            <Text fontSize={14} color="$textPrimary">
              {analyzedItems.length} stk
            </Text>
          </XStack>

          {pickupDetails && (
            <>
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
                  {pickupDetails.address}
                </Text>
              </XStack>

              <XStack justifyContent="space-between">
                <Text fontSize={14} color="$textSecondary">
                  Dato
                </Text>
                <Text fontSize={14} color="$textPrimary">
                  {formatDateDisplay(pickupDetails.pickup_date)}
                </Text>
              </XStack>

              <XStack justifyContent="space-between">
                <Text fontSize={14} color="$textSecondary">
                  Tidspunkt
                </Text>
                <Text fontSize={14} color="$textPrimary">
                  {pickupDetails.pickup_time_window}
                </Text>
              </XStack>
            </>
          )}

          {priceBreakdown && (
            <>
              <Separator marginVertical="$sm" />
              <XStack justifyContent="space-between" alignItems="center">
                <Text fontSize={18} fontWeight="700" color="$textPrimary">
                  Totalt
                </Text>
                <Text fontSize={20} fontWeight="700" color="$primary">
                  {formatKr(priceBreakdown.total)}
                </Text>
              </XStack>
            </>
          )}
        </Card>

        {error && (
          <Card backgroundColor="$errorLight">
            <XStack gap="$md" alignItems="center">
              <Ionicons name="alert-circle" size={20} color={colors.error} />
              <Text fontSize={14} color="$error" flex={1}>
                {error}
              </Text>
            </XStack>
          </Card>
        )}
      </ScrollView>

      <YStack
        padding="$xl"
        paddingTop="$md"
        gap="$md"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleConfirm}
          disabled={!pickupDetails || !priceBreakdown}
        >
          Bekreft bestilling
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => router.back()}
        >
          Tilbake
        </Button>
      </YStack>
    </YStack>
  );
}
