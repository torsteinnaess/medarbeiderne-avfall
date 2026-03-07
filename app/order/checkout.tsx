import { Button, Card, StepIndicator } from "@/components/ui";
import { useCreateOrder, useCreatePayment } from "@/lib/api/hooks";
import { moveTempImages } from "@/lib/api/images";
import { useAuthStore } from "@/lib/stores/auth";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Platform } from "react-native";
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
  const {
    analyzedItems,
    storagePaths,
    setStoragePaths,
    pickupDetails,
    priceBreakdown,
    reset,
  } = useOrderDraftStore();

  const createOrderMutation = useCreateOrder();
  const createPaymentMutation = useCreatePayment();
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<
    "idle" | "creating_order" | "creating_payment" | "opening_payment"
  >("idle");

  const userId = useAuthStore((s) => s.user?.id);

  const handleConfirm = async () => {
    if (!pickupDetails || !priceBreakdown || !userId) return;
    setError(null);
    setStep("creating_order");

    try {
      // Flytt bilder fra temp/ til brukerens permanente mappe
      let finalPaths = storagePaths;
      const hasTempImages = storagePaths.some((p) => p.startsWith("temp/"));
      if (hasTempImages) {
        console.log("[Checkout] Flytter temp-bilder til brukermappe...");
        finalPaths = await moveTempImages(storagePaths, userId);
        setStoragePaths(finalPaths);
        console.log("[Checkout] Nye paths:", finalPaths);
      }

      // Opprett ordre
      const order = await createOrderMutation.mutateAsync({
        items: analyzedItems,
        pickup_details: pickupDetails,
        image_storage_paths: finalPaths,
        price_breakdown: priceBreakdown,
      });

      // Ordre opprettet — nå opprett betaling
      setStep("creating_payment");
      const paymentData = await createPaymentMutation.mutateAsync(order.id);

      setStep("opening_payment");
      reset();

      if (Platform.OS === "web") {
        // På web: åpne i nytt vindu/tab
        window.open(paymentData.payment_url, "_self");
      } else {
        // På native: åpne i systemnettleser
        await WebBrowser.openBrowserAsync(paymentData.payment_url);
        // Bruker er tilbake fra nettleser — naviger til bekreftelse
        router.push(`/order/confirmation?order_id=${order.id}`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ukjent feil";
      setStep("idle");
      setError(message);
      console.error("[Checkout] Error:", message);
    }
  };

  const isProcessing = step !== "idle";

  const statusMessages: Record<typeof step, string> = {
    idle: "",
    creating_order: "Oppretter bestilling...",
    creating_payment: "Forbereder betaling...",
    opening_payment: "Åpner betalingsvindu...",
  };

  if (isProcessing) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={5} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$lg">
          <Spinner size="large" color="$primary" />
          <Text fontSize={16} color="$textSecondary">
            {statusMessages[step]}
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
          disabled={!pickupDetails || !priceBreakdown || isProcessing}
        >
          Bekreft og betal
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
