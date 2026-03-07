import { useAuthStore } from "@/lib/stores/auth";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs, useRouter } from "expo-router";
import { ActivityIndicator, Pressable } from "react-native";
import { YStack } from "tamagui";

export default function AdminLayout() {
  const { profile, isInitialized, isLoading } = useAuthStore();

  // Wait until auth is fully initialized and profile is loaded
  if (!isInitialized || isLoading) {
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

  // Redirect non-admin users only after auth is fully resolved
  if (profile?.role !== "admin") {
    return <Redirect href="/(tabs)" />;
  }

  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.secondary,
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "700",
        },
        headerLeft: () => (
          <Pressable
            onPress={() => router.push("/(tabs)")}
            style={{ marginLeft: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Ordrer",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: "Brukere",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
