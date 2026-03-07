import { colors } from "@/lib/theme";
import { Stack } from "expo-router";

export default function OrderFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        headerBackTitle: "Tilbake",
      }}
    >
      <Stack.Screen name="upload" options={{ title: "Last opp bilder" }} />
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
