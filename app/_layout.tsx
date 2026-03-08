import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { TamaguiProvider } from "tamagui";

import "@/assets/global.css";
import "@tamagui/font-inter/css/400.css";
import "@tamagui/font-inter/css/500.css";
import "@tamagui/font-inter/css/600.css";
import "@tamagui/font-inter/css/700.css";
import "@tamagui/font-inter/css/800.css";

import { ToastContainer } from "@/components/ui";
import { useColorScheme } from "@/components/useColorScheme";
import config from "@/config/tamagui.config";
import { AuthProvider } from "@/lib/providers/auth-provider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { colors } from "@/lib/theme";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Regular.otf"),
    InterMedium: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterSemiBold: require("@tamagui/font-inter/otf/Inter-SemiBold.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
    InterExtraBold: require("@tamagui/font-inter/otf/Inter-ExtraBold.otf"),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
    },
  };

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme ?? "light"}>
      <QueryProvider>
        <AuthProvider>
          <ThemeProvider value={colorScheme === "dark" ? DarkTheme : navTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
              <Stack.Screen
                name="order"
                options={{
                  headerShown: false,
                  presentation: "card",
                }}
              />
              <Stack.Screen
                name="orders/[id]"
                options={{
                  title: "Ordredetaljer",
                  headerBackTitle: "Tilbake",
                }}
              />
              <Stack.Screen
                name="admin/order/[id]"
                options={{
                  title: "Admin — Ordredetaljer",
                  headerBackTitle: "Tilbake",
                }}
              />
            </Stack>
            <ToastContainer />
          </ThemeProvider>
        </AuthProvider>
      </QueryProvider>
    </TamaguiProvider>
  );
}
