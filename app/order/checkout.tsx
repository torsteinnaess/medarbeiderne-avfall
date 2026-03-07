import { Button, Card, StepIndicator } from "@/components/ui";
import {
    useCalculatePrice,
    useCreateOrder,
    useCreatePayment,
} from "@/lib/api/hooks";
import { moveTempImages } from "@/lib/api/images";
import type { PaymentMethod } from "@/lib/api/payments";
import { useAuthStore } from "@/lib/stores/auth";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useRef, useState } from "react";
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

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] =
  [
    { value: "creditcard", label: "Bankkort", icon: "card-outline" },
    { value: "vipps", label: "Vipps", icon: "phone-portrait-outline" },
    { value: "apple-pay", label: "Apple Pay", icon: "logo-apple" },
    { value: "google-pay", label: "Google Pay", icon: "logo-google" },
  ];

export default function CheckoutScreen() {
  const router = useRouter();
  const {
    analyzedItems,
    storagePaths,
    setStoragePaths,
    pickupDetails,
    priceBreakdown,
    setPriceBreakdown,
    reset,
  } = useOrderDraftStore();

  const priceMutation = useCalculatePrice();
  const createOrderMutation = useCreateOrder();
  const createPaymentMutation = useCreatePayment();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("creditcard");
  const [step, setStep] = useState<
    "idle" | "creating_order" | "creating_payment" | "opening_payment"
  >("idle");
  const hasStartedPrice = useRef(false);

  const userId = useAuthStore((s) => s.user?.id);

  // Beregn pris automatisk hvis ikke allerede gjort
  useEffect(() => {
    if (
      !hasStartedPrice.current &&
      pickupDetails &&
      analyzedItems.length > 0 &&
      !priceBreakdown
    ) {
      hasStartedPrice.current = true;
      priceMutation.mutate(
        {
          items: analyzedItems,
          floor: pickupDetails.floor,
          has_elevator: pickupDetails.has_elevator,
          has_parking: pickupDetails.has_parking,
          carry_distance: pickupDetails.carry_distance,
        },
        {
          onSuccess: (data) => setPriceBreakdown(data),
        },
      );
    }
  }, []);

  const breakdown = priceBreakdown ?? priceMutation.data;

  const handleConfirm = async () => {
    if (!pickupDetails || !breakdown || !userId) {
      console.warn("[Checkout] Guard failed:", {
        pickupDetails: !!pickupDetails,
        breakdown: !!breakdown,
        userId: !!userId,
      });
      if (!userId) setError("Du må være innlogget for å bestille.");
      return;
    }
    setError(null);
    setDebugInfo("Guard passed, starting...");
    setStep("creating_order");

    try {
      // Flytt bilder fra temp/ til brukerens permanente mappe
      let finalPaths = storagePaths;
      const hasTempImages = storagePaths.some((p) => p.startsWith("temp/"));
      setDebugInfo(
        `hasTempImages=${hasTempImages}, paths=${storagePaths.length}`,
      );
      if (hasTempImages) {
        console.log(
          "[Checkout] Flytter temp-bilder til brukermappe...",
          storagePaths,
        );
        setDebugInfo("Moving temp images...");
        finalPaths = await moveTempImages(storagePaths, userId);
        setStoragePaths(finalPaths);
        console.log("[Checkout] Nye paths:", finalPaths);
      }

      // Opprett ordre
      setDebugInfo("Creating order...");
      console.log("[Checkout] Oppretter ordre...");
      const order = await createOrderMutation.mutateAsync({
        items: analyzedItems,
        pickup_details: pickupDetails,
        image_storage_paths: finalPaths,
        price_breakdown: breakdown,
      });
      console.log("[Checkout] Ordre opprettet:", order.id);

      // Ordre opprettet — nå opprett betaling
      setStep("creating_payment");
      console.log("[Checkout] Oppretter betaling...");

      // Generer plattform-korrekte redirect-URL-er
      const continueUrl =
        Platform.OS === "web"
          ? `${window.location.origin}/order/confirmation?order_id=${order.id}`
          : Linking.createURL(`/order/confirmation`, {
              queryParams: { order_id: order.id },
            });
      const cancelUrl =
        Platform.OS === "web"
          ? `${window.location.origin}/order/checkout?order_id=${order.id}`
          : Linking.createURL(`/order/checkout`, {
              queryParams: { order_id: order.id },
            });

      const paymentData = await createPaymentMutation.mutateAsync({
        orderId: order.id,
        paymentMethod: selectedPaymentMethod,
        continueUrl,
        cancelUrl,
      });
      console.log(
        "[Checkout] Betaling opprettet, URL:",
        paymentData.payment_url,
      );

      setStep("opening_payment");
      reset();

      if (Platform.OS === "web") {
        window.open(paymentData.payment_url, "_self");
      } else {
        await WebBrowser.openAuthSessionAsync(
          paymentData.payment_url,
          continueUrl,
        );
        router.push(`/order/confirmation?order_id=${order.id}`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ukjent feil";
      setStep("idle");
      setError(message);
      console.error("[Checkout] Error:", e);
    }
  };

  const isProcessing = step !== "idle";

  const statusMessages: Record<typeof step, string> = {
    idle: "",
    creating_order: "Oppretter bestilling...",
    creating_payment: "Forbereder betaling...",
    opening_payment: "Åpner betalingsvindu...",
  };

  // Laster pris
  if (priceMutation.isPending) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={4} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$lg">
          <Spinner size="large" color="$primary" />
          <Text fontSize={16} color="$textSecondary">
            Beregner pris...
          </Text>
        </YStack>
      </YStack>
    );
  }

  if (priceMutation.isError) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={4} />
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$lg"
          padding="$xl"
        >
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />
          <Text fontSize={16} color="$textPrimary" textAlign="center">
            Kunne ikke beregne pris. Prøv igjen.
          </Text>
          <Button
            variant="primary"
            size="md"
            onPress={() => {
              hasStartedPrice.current = false;
              priceMutation.reset();
            }}
          >
            Prøv igjen
          </Button>
        </YStack>
      </YStack>
    );
  }

  if (isProcessing) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={4} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$lg">
          <Spinner size="large" color="$primary" />
          <Text fontSize={16} color="$textSecondary">
            {statusMessages[step]}
          </Text>
          {debugInfo ? (
            <Text fontSize={12} color="$textMuted">
              DEBUG: {debugInfo}
            </Text>
          ) : null}
        </YStack>
      </YStack>
    );
  }

  if (!breakdown) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={4} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$lg">
          <Text fontSize={16} color="$textSecondary">
            Ingen prisdata tilgjengelig.
          </Text>
          <Button variant="outline" size="md" onPress={() => router.back()}>
            Tilbake
          </Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <StepIndicator currentStep={4} />
      <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 16 }}>
        <H2 color="$textPrimary">Prisoversikt og betaling</H2>

        {/* Hentedetaljer */}
        {pickupDetails && (
          <Card gap="$md">
            <Text fontSize={16} fontWeight="600" color="$textPrimary">
              Hentedetaljer
            </Text>

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
          </Card>
        )}

        {/* Prisdetaljer */}
        <Card gap="$md">
          <Text fontSize={16} fontWeight="600" color="$textPrimary">
            Gjenstander
          </Text>
          {breakdown.items.map((item, index) => (
            <XStack
              key={index}
              justifyContent="space-between"
              alignItems="center"
            >
              <Text fontSize={14} color="$textSecondary" flex={1}>
                {item.label}
              </Text>
              <Text fontSize={14} color="$textPrimary" fontWeight="500">
                {formatKr(item.amount)}
              </Text>
            </XStack>
          ))}

          {breakdown.surcharges.length > 0 && (
            <>
              <Separator marginVertical="$sm" />
              <Text fontSize={16} fontWeight="600" color="$textPrimary">
                Tillegg
              </Text>
              {breakdown.surcharges.map((surcharge, index) => (
                <XStack
                  key={index}
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Text fontSize={14} color="$textSecondary" flex={1}>
                    {surcharge.label}
                  </Text>
                  <Text fontSize={14} color="$textPrimary" fontWeight="500">
                    {formatKr(surcharge.amount)}
                  </Text>
                </XStack>
              ))}
            </>
          )}

          <Separator marginVertical="$sm" />

          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={18} fontWeight="700" color="$textPrimary">
              Totalt
            </Text>
            <Text fontSize={20} fontWeight="700" color="$primary">
              {formatKr(breakdown.total)}
            </Text>
          </XStack>
        </Card>

        {/* Betalingsmetode */}
        <Card gap="$md">
          <Text fontSize={16} fontWeight="600" color="$textPrimary">
            Velg betalingsmetode
          </Text>
          {PAYMENT_METHODS.map((method) => {
            const isSelected = selectedPaymentMethod === method.value;
            return (
              <XStack
                key={method.value}
                alignItems="center"
                gap="$md"
                padding="$md"
                borderRadius="$md"
                borderWidth={2}
                borderColor={isSelected ? "$primary" : "$border"}
                backgroundColor={isSelected ? "$primaryLight" : "$surface"}
                pressStyle={{ opacity: 0.8 }}
                onPress={() => setSelectedPaymentMethod(method.value)}
              >
                <Ionicons
                  name={method.icon as "card-outline"}
                  size={24}
                  color={isSelected ? colors.primary : colors.textSecondary}
                />
                <Text
                  fontSize={16}
                  fontWeight={isSelected ? "600" : "400"}
                  color={isSelected ? "$primary" : "$textPrimary"}
                  flex={1}
                >
                  {method.label}
                </Text>
                {isSelected && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.primary}
                  />
                )}
              </XStack>
            );
          })}
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
          disabled={!pickupDetails || !breakdown || !userId || isProcessing}
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
