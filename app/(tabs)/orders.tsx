import { Button, Card, OrderStatusBadge } from "@/components/ui";
import { useOrders } from "@/lib/api/hooks";
import { colors } from "@/lib/theme";
import type { Order } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ActivityIndicator, FlatList, Pressable } from "react-native";
import { H4, Text, XStack, YStack } from "tamagui";

function OrderRow({ order }: { order: Order }) {
  const router = useRouter();
  const date = new Date(order.created_at).toLocaleDateString("nb-NO");
  const total = `${Number(order.total_price).toLocaleString("nb-NO")} kr`;

  return (
    <Pressable onPress={() => router.push(`/orders/${order.id}`)}>
      <Card marginBottom="$sm" pressable>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1} gap="$xs">
            <XStack alignItems="center" gap="$sm">
              <Text fontSize={14} fontWeight="700" color="$textPrimary">
                {order.id.slice(0, 8)}...
              </Text>
              <OrderStatusBadge status={order.status} />
            </XStack>
            <Text fontSize={13} color="$textSecondary">
              {order.pickup_address}
            </Text>
            <XStack gap="$md">
              <Text fontSize={12} color="$textMuted">
                {date}
              </Text>
              <Text fontSize={12} fontWeight="600" color="$primary">
                {total}
              </Text>
            </XStack>
          </YStack>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </XStack>
      </Card>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const { data: orders, isLoading, error, refetch } = useOrders();

  if (isLoading) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
        padding="$xl"
      >
        <Text color="$error">{error.message}</Text>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        onRefresh={refetch}
        refreshing={isLoading}
        ListEmptyComponent={
          <YStack alignItems="center" padding="$3xl" gap="$lg">
            <Ionicons
              name="receipt-outline"
              size={64}
              color={colors.textMuted}
            />
            <H4 color="$textMuted">Ingen bestillinger ennå</H4>
            <Text fontSize={14} color="$textSecondary" textAlign="center">
              Når du bestiller en henting, vil den vises her.
            </Text>
            <Button
              variant="primary"
              size="md"
              onPress={() => router.push("/order/upload")}
              marginTop="$md"
            >
              Bestill din første henting
            </Button>
          </YStack>
        }
        renderItem={({ item }) => <OrderRow order={item} />}
      />
    </YStack>
  );
}
