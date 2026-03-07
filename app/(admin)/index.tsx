import { Card } from "@/components/ui";
import { useAdminStats } from "@/lib/api/hooks";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, ScrollView } from "react-native";
import { H2, Text, XStack, YStack } from "tamagui";

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <Card elevated flex={1} minWidth={140}>
      <YStack gap="$sm">
        <XStack alignItems="center" gap="$sm">
          <Ionicons name={icon} size={20} color={color} />
          <Text fontSize={13} color="$textSecondary" fontWeight="500">
            {label}
          </Text>
        </XStack>
        <Text fontSize={24} fontWeight="800" color="$textPrimary">
          {value}
        </Text>
      </YStack>
    </Card>
  );
}

export default function AdminDashboardScreen() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text marginTop="$md" color="$textSecondary">Laster dashboard...</Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" padding="$xl">
        <Ionicons name="warning-outline" size={48} color={colors.error} />
        <Text marginTop="$md" color="$error" textAlign="center">
          Kunne ikke laste dashboard: {error.message}
        </Text>
      </YStack>
    );
  }

  const formatCurrency = (amount: number) =>
    `${amount.toLocaleString("nb-NO", { minimumFractionDigits: 0 })} kr`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <YStack padding="$xl" gap="$xl">
        <H2 color="$textPrimary">Oversikt</H2>

        <XStack flexWrap="wrap" gap="$md">
          <StatCard
            icon="receipt-outline"
            label="Totale ordrer"
            value={String(stats?.totalOrders ?? 0)}
            color={colors.primary}
          />
          <StatCard
            icon="people-outline"
            label="Brukere"
            value={String(stats?.totalUsers ?? 0)}
            color={colors.info}
          />
        </XStack>

        <XStack flexWrap="wrap" gap="$md">
          <StatCard
            icon="cash-outline"
            label="Total omsetning"
            value={formatCurrency(stats?.totalRevenue ?? 0)}
            color={colors.success}
          />
          <StatCard
            icon="time-outline"
            label="Ventende"
            value={String(stats?.pendingOrders ?? 0)}
            color={colors.warning}
          />
        </XStack>

        <H2 color="$textPrimary">Ordrestatus</H2>

        <XStack flexWrap="wrap" gap="$md">
          <StatCard
            icon="checkmark-circle-outline"
            label="Bekreftet"
            value={String(stats?.confirmedOrders ?? 0)}
            color={colors.info}
          />
          <StatCard
            icon="checkmark-done-outline"
            label="Fullført"
            value={String(stats?.completedOrders ?? 0)}
            color={colors.success}
          />
        </XStack>

        <XStack flexWrap="wrap" gap="$md">
          <StatCard
            icon="close-circle-outline"
            label="Kansellert"
            value={String(stats?.cancelledOrders ?? 0)}
            color={colors.error}
          />
        </XStack>
      </YStack>
    </ScrollView>
  );
}

