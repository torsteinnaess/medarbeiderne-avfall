import { Button, Card, StepIndicator } from "@/components/ui";
import { useCalculatePrice } from "@/lib/api/hooks";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
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

export default function PriceScreen() {
  const router = useRouter();
  const { analyzedItems, pickupDetails, priceBreakdown, setPriceBreakdown } =
    useOrderDraftStore();
  const priceMutation = useCalculatePrice();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (!hasStarted.current && pickupDetails && analyzedItems.length > 0) {
      hasStarted.current = true;
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
              hasStarted.current = false;
              priceMutation.reset();
            }}
          >
            Prøv igjen
          </Button>
        </YStack>
      </YStack>
    );
  }

  const breakdown = priceBreakdown ?? priceMutation.data;

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
        <H2 color="$textPrimary">Prisoversikt</H2>

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
            <Text fontSize={14} color="$textSecondary">
              Delsum
            </Text>
            <Text fontSize={14} color="$textPrimary">
              {formatKr(breakdown.subtotal)}
            </Text>
          </XStack>

          {breakdown.surcharges_total > 0 && (
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={14} color="$textSecondary">
                Tillegg totalt
              </Text>
              <Text fontSize={14} color="$textPrimary">
                {formatKr(breakdown.surcharges_total)}
              </Text>
            </XStack>
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
          onPress={() => router.push("/order/checkout")}
        >
          Gå til betaling
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
