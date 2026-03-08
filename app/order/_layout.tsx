import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Pressable } from "react-native";

export default function OrderFlowLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerBackTitle: "Tilbake",
      }}
    >
      <Stack.Screen
        name="upload"
        options={{
          title: "Last opp bilder",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              style={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.textPrimary}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="analysis" options={{ title: "Analyse" }} />
      <Stack.Screen
        name="pickup-details"
        options={{ title: "Hentedetaljer" }}
      />
      <Stack.Screen name="checkout" options={{ title: "Pris og betaling" }} />
      <Stack.Screen
        name="confirmation"
        options={{ title: "Bekreftelse", headerBackVisible: false }}
      />
    </Stack>
  );
}
