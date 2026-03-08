import { Card, OrderStatusBadge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { useUpdateOrderStatus } from "@/lib/api/hooks";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import {
    ORDER_STATUSES,
    ORDER_STATUS_LABELS,
    WASTE_CATEGORY_LABELS,
    type Order,
    type OrderStatus,
    type WasteCategory,
} from "@/lib/types";
import { withNetworkError } from "@/lib/utils/network-error";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView } from "react-native";
import { H2, H4, Separator, Text, XStack, YStack } from "tamagui";

export default function AdminOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const updateStatus = useUpdateOrderStatus();

  useEffect(() => {
    if (!id) return;
    loadOrder(id);
  }, [id]);

  async function loadOrder(orderId: string) {
    setLoading(true);
    try {
      const data = await withNetworkError(async () => {
        const { data, error } = await supabase
          .from("orders")
          .select("*, items:order_items(*), images:order_images(*)")
          .eq("id", orderId)
          .single();
        if (error) throw new Error(error.message);
        return data as Order;
      }, "Henting av ordre");
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ukjent feil");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!order) return;
    Alert.alert(
      "Bekreft endring",
      `Endre status til "${ORDER_STATUS_LABELS[newStatus]}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Bekreft",
          onPress: () => {
            updateStatus.mutate(
              { orderId: order.id, status: newStatus },
              { onSuccess: (updated) => setOrder(updated) },
            );
          },
        },
      ],
    );
  };

  if (loading) {
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
          {error ?? "Ordre ikke funnet"}
        </Text>
        <Button
          variant="outline"
          size="$sm"
          marginTop="$lg"
          onPress={() => router.back()}
        >
          Tilbake
        </Button>
      </YStack>
    );
  }

  const date = new Date(order.created_at).toLocaleDateString("nb-NO");
  const formatKr = (n: number) => `${Number(n).toLocaleString("nb-NO")} kr`;

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
            Ordre
          </H2>
          <OrderStatusBadge status={order.status} />
        </XStack>

        {/* Info */}
        <Card>
          <YStack gap="$md">
            <InfoRow label="Ordre-ID" value={order.id} />
            <InfoRow label="Opprettet" value={date} />
            <InfoRow label="Adresse" value={order.pickup_address} />
            <InfoRow label="Etasje" value={String(order.floor)} />
            <InfoRow label="Heis" value={order.has_elevator ? "Ja" : "Nei"} />
            <InfoRow
              label="Parkering"
              value={order.has_parking ? "Ja" : "Nei"}
            />
            <InfoRow label="Bæreavstand" value={order.carry_distance} />
            <InfoRow label="Hentedato" value={order.pickup_date} />
            <InfoRow label="Tidspunkt" value={order.pickup_time_window} />
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

        {/* Status actions */}
        <H4 color="$textPrimary">Endre status</H4>
        <XStack flexWrap="wrap" gap="$sm">
          {ORDER_STATUSES.filter((s) => s !== order.status).map((s) => (
            <Button
              key={s}
              variant="outline"
              size="$sm"
              onPress={() => handleStatusChange(s)}
              disabled={updateStatus.isPending}
            >
              {ORDER_STATUS_LABELS[s]}
            </Button>
          ))}
        </XStack>
      </YStack>
    </ScrollView>
  );
}

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
