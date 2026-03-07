import { Card, OrderStatusBadge } from "@/components/ui";
import { useAdminOrders, useUpdateOrderStatus } from "@/lib/api/hooks";
import { colors } from "@/lib/theme";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type Order,
  type OrderStatus,
} from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable } from "react-native";
import { H4, Text, XStack, YStack } from "tamagui";

const STATUS_FILTERS: Array<{ label: string; value: OrderStatus | undefined }> = [
  { label: "Alle", value: undefined },
  ...ORDER_STATUSES.map((s) => ({ label: ORDER_STATUS_LABELS[s], value: s as OrderStatus })),
];

function OrderRow({ order, onUpdateStatus }: { order: Order; onUpdateStatus: (id: string, status: OrderStatus) => void }) {
  const router = useRouter();
  const date = new Date(order.created_at).toLocaleDateString("nb-NO");
  const total = `${Number(order.total_price).toLocaleString("nb-NO")} kr`;

  const handleStatusChange = () => {
    const options = ORDER_STATUSES.filter((s) => s !== order.status).map((s) => ({
      text: ORDER_STATUS_LABELS[s],
      onPress: () => onUpdateStatus(order.id, s),
    }));
    Alert.alert("Endre status", `Nåværende: ${ORDER_STATUS_LABELS[order.status]}`, [
      ...options,
      { text: "Avbryt", style: "cancel" },
    ]);
  };

  return (
    <Pressable onPress={() => router.push(`/admin/order/${order.id}`)}>
      <Card marginBottom="$sm" pressable>
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1} gap="$xs">
            <XStack alignItems="center" gap="$sm">
              <Text fontSize={14} fontWeight="700" color="$textPrimary">
                {order.id.slice(0, 8)}...
              </Text>
              <OrderStatusBadge status={order.status} />
            </XStack>
            <Text fontSize={13} color="$textSecondary">{order.pickup_address}</Text>
            <XStack gap="$md">
              <Text fontSize={12} color="$textMuted">{date}</Text>
              <Text fontSize={12} fontWeight="600" color="$primary">{total}</Text>
            </XStack>
          </YStack>
          <Pressable onPress={handleStatusChange} hitSlop={8}>
            <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
          </Pressable>
        </XStack>
      </Card>
    </Pressable>
  );
}

export default function AdminOrdersScreen() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const { data: orders, isLoading, error, refetch } = useAdminOrders(statusFilter);
  const updateStatus = useUpdateOrderStatus();

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    updateStatus.mutate({ orderId, status });
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Filter chips */}
      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.label}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setStatusFilter(item.value)}>
            <XStack
              paddingHorizontal="$md"
              paddingVertical="$xs"
              borderRadius="$full"
              backgroundColor={statusFilter === item.value ? "$secondary" : "$surface"}
              borderWidth={1}
              borderColor={statusFilter === item.value ? "$secondary" : "$border"}
            >
              <Text
                fontSize={13}
                fontWeight="600"
                color={statusFilter === item.value ? "#FFFFFF" : "$textSecondary"}
              >
                {item.label}
              </Text>
            </XStack>
          </Pressable>
        )}
      />

      {isLoading ? (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={colors.primary} />
        </YStack>
      ) : error ? (
        <YStack flex={1} alignItems="center" justifyContent="center" padding="$xl">
          <Text color="$error">{error.message}</Text>
        </YStack>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <YStack alignItems="center" padding="$3xl" gap="$md">
              <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
              <H4 color="$textMuted">Ingen ordrer funnet</H4>
            </YStack>
          }
          renderItem={({ item }) => (
            <OrderRow order={item} onUpdateStatus={handleUpdateStatus} />
          )}
        />
      )}
    </YStack>
  );
}

