import { Card } from "@/components/ui";
import { useAdminUsers } from "@/lib/api/hooks";
import { colors } from "@/lib/theme";
import type { AdminUserWithOrderCount } from "@/lib/api/admin";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, FlatList } from "react-native";
import { H4, Text, XStack, YStack } from "tamagui";

function UserRow({ user }: { user: AdminUserWithOrderCount }) {
  const date = new Date(user.created_at).toLocaleDateString("nb-NO");

  return (
    <Card marginBottom="$sm">
      <XStack alignItems="center" gap="$md">
        <YStack
          width={44}
          height={44}
          borderRadius="$full"
          backgroundColor="$primaryLight"
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name="person" size={22} color={colors.primary} />
        </YStack>
        <YStack flex={1} gap="$xs">
          <XStack alignItems="center" gap="$sm">
            <Text fontSize={15} fontWeight="700" color="$textPrimary">
              {user.name || "Uten navn"}
            </Text>
            {user.role === "admin" && (
              <XStack
                paddingHorizontal="$sm"
                paddingVertical={2}
                borderRadius="$sm"
                backgroundColor="$secondaryLight"
              >
                <Text fontSize={11} fontWeight="700" color="#FFFFFF">
                  Admin
                </Text>
              </XStack>
            )}
          </XStack>
          <Text fontSize={13} color="$textSecondary">{user.email}</Text>
          <XStack gap="$md">
            <Text fontSize={12} color="$textMuted">
              {user.phone || "Ingen telefon"}
            </Text>
            <Text fontSize={12} color="$textMuted">
              Registrert: {date}
            </Text>
          </XStack>
        </YStack>
        <YStack alignItems="center" gap="$xs">
          <Text fontSize={20} fontWeight="800" color="$primary">
            {user.order_count}
          </Text>
          <Text fontSize={11} color="$textMuted">ordrer</Text>
        </YStack>
      </XStack>
    </Card>
  );
}

export default function AdminUsersScreen() {
  const { data: users, isLoading, error, refetch } = useAdminUsers();

  if (isLoading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <ActivityIndicator size="large" color={colors.primary} />
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background" padding="$xl">
        <Text color="$error">{error.message}</Text>
      </YStack>
    );
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      style={{ backgroundColor: colors.background }}
      onRefresh={refetch}
      refreshing={isLoading}
      ListEmptyComponent={
        <YStack alignItems="center" padding="$3xl" gap="$md">
          <Ionicons name="people-outline" size={48} color={colors.textMuted} />
          <H4 color="$textMuted">Ingen brukere funnet</H4>
        </YStack>
      }
      renderItem={({ item }) => <UserRow user={item} />}
    />
  );
}

