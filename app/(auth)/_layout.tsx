import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Stack } from "expo-router";

export default function AuthLayout() {
  const isOrderFlow = useOrderDraftStore((s) => s.pickupDetails !== null);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      initialRouteName={isOrderFlow ? "register" : "login"}
    >
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{
          animation: "slide_from_right",
          ...(isOrderFlow && {
            headerShown: true,
            title: "Kontaktinfo",
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.textPrimary,
            headerBackTitle: "Tilbake",
          }),
        }}
      />
    </Stack>
  );
}
