import { Button, Card, OrderStatusBadge } from "@/components/ui";
import { useCancelOrder, useOrder } from "@/lib/api/hooks";
import { colors } from "@/lib/theme";
import {
    ORDER_STATUS_LABELS,
    WASTE_CATEGORY_LABELS,
    type WasteCategory,
} from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, ScrollView } from "react-native";
import { H2, H4, Separator, Text, XStack, YStack } from "tamagui";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <XStack justifyContent="space-between" alignItems="flex-start">
      <Text fontSize={13} color="$textSecondary" flex={1}>
        {label}
      </Text>
      <Text
        fontSize={13}
        fontWeight="600"
        color="$textPrimary"
        flex={2}
        textAlign="right"
      >
        {value}
      </Text>
    </XStack>
  );
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading, error } = useOrder(id ?? "");
  const cancelOrder = useCancelOrder();

  const handleCancel = () => {
    if (!order) return;
    Alert.alert(
      "Kanseller bestilling",
      "Er du sikker på at du vil kansellere denne bestillingen?",
      [
        { text: "Nei", style: "cancel" },
        {
          text: "Ja, kanseller",
          style: "destructive",
          onPress: () => {
            cancelOrder.mutate(order.id, {
              onSuccess: () => router.back(),
            });
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </YStack>
    );
  }

  if (error || !order) {
    return (
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        backgroundColor="$background"
        padding="$xl"
      >
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text marginTop="$md" color="$error">
          {error?.message ?? "Ordre ikke funnet"}
        </Text>
        <Button
          variant="outline"
          size="sm"
          marginTop="$lg"
          onPress={() => router.back()}
        >
          Tilbake
        </Button>
      </YStack>
    );
  }

  const formatKr = (n: number) => `${Number(n).toLocaleString("nb-NO")} kr`;
  const createdDate = new Date(order.created_at).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const pickupDate = new Date(order.pickup_date).toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const canCancel = order.status === "pending" || order.status === "confirmed";

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <YStack padding="$xl" gap="$xl">
        {/* Header */}
        <XStack alignItems="center" gap="$md">
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors.textPrimary}
            onPress={() => router.back()}
          />
          <H2 flex={1} color="$textPrimary">
            Bestilling
          </H2>
          <OrderStatusBadge status={order.status} />
        </XStack>

        {/* Status summary */}
        <Card elevated>
          <YStack alignItems="center" gap="$sm" paddingVertical="$md">
            <Text fontSize={14} color="$textSecondary">
              Status
            </Text>
            <Text fontSize={20} fontWeight="700" color="$textPrimary">
              {ORDER_STATUS_LABELS[order.status]}
            </Text>
            <Text fontSize={13} color="$textMuted">
              Bestilt {createdDate}
            </Text>
          </YStack>
        </Card>

        {/* Pickup info */}
        <H4 color="$textPrimary">Hentedetaljer</H4>
        <Card>
          <YStack gap="$md">
            <InfoRow label="Adresse" value={order.pickup_address} />
            <InfoRow label="Hentedato" value={pickupDate} />
            <InfoRow label="Tidspunkt" value={order.pickup_time_window} />
            <InfoRow label="Etasje" value={String(order.floor)} />
            <InfoRow label="Heis" value={order.has_elevator ? "Ja" : "Nei"} />
            <InfoRow
              label="Parkering"
              value={order.has_parking ? "Ja" : "Nei"}
            />
            <InfoRow label="Bæreavstand" value={order.carry_distance} />
            {order.notes ? (
              <InfoRow label="Notater" value={order.notes} />
            ) : null}
          </YStack>
        </Card>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <>
            <H4 color="$textPrimary">Gjenstander ({order.items.length})</H4>
            {order.items.map((item) => (
              <Card key={item.id}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack flex={1} gap="$xs">
                    <Text fontWeight="600" color="$textPrimary">
                      {item.name}
                    </Text>
                    <Text fontSize={12} color="$textSecondary">
                      {WASTE_CATEGORY_LABELS[item.category as WasteCategory] ??
                        item.category}
                    </Text>
                    <Text fontSize={12} color="$textMuted">
                      {item.estimated_weight_kg} kg
                    </Text>
                  </YStack>
                  <Text fontWeight="700" color="$primary">
                    {formatKr(item.item_total)}
                  </Text>
                </XStack>
              </Card>
            ))}
          </>
        )}

        {/* Pricing */}
        <H4 color="$textPrimary">Pris</H4>
        <Card>
          <YStack gap="$sm">
            <XStack justifyContent="space-between">
              <Text color="$textSecondary">Delsum</Text>
              <Text fontWeight="600">{formatKr(order.subtotal)}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$textSecondary">Tillegg</Text>
              <Text fontWeight="600">{formatKr(order.surcharges)}</Text>
            </XStack>
            <Separator marginVertical="$sm" />
            <XStack justifyContent="space-between">
              <Text fontWeight="700" fontSize={16}>
                Total
              </Text>
              <Text fontWeight="800" fontSize={16} color="$primary">
                {formatKr(order.total_price)}
              </Text>
            </XStack>
          </YStack>
        </Card>

        {/* Cancel action */}
        {canCancel && (
          <Button
            variant="destructive"
            size="md"
            fullWidth
            onPress={handleCancel}
            disabled={cancelOrder.isPending}
          >
            {cancelOrder.isPending ? "Kansellerer..." : "Kanseller bestilling"}
          </Button>
        )}
      </YStack>
    </ScrollView>
  );
}
