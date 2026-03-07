import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import {
    getUserFriendlyErrorMessage,
    isNetworkError,
} from "@/lib/utils/network-error";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1, Separator, Text, View, XStack, YStack } from "tamagui";

function translateAuthError(message: string): string {
  if (message.includes("Invalid login credentials")) {
    return "Feil e-post eller passord";
  }
  if (message.includes("Email not confirmed")) {
    return "E-posten er ikke bekreftet. Sjekk innboksen din.";
  }
  if (message.includes("Too many requests")) {
    return "For mange forsøk. Prøv igjen senere.";
  }
  return "Noe gikk galt. Prøv igjen.";
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email.trim()) {
      setError("Vennligst fyll inn e-post");
      return;
    }
    if (!password) {
      setError("Vennligst fyll inn passord");
      return;
    }

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError(translateAuthError(authError.message));
      } else {
        // Login succeeded — if in order flow, continue to checkout
        const hasOrderDraft =
          useOrderDraftStore.getState().pickupDetails !== null;
        if (hasOrderDraft) {
          router.replace("/order/checkout");
        } else {
          router.replace("/");
        }
      }
    } catch (error) {
      if (isNetworkError(error)) {
        setError(getUserFriendlyErrorMessage(error));
      } else {
        setError("Noe gikk galt. Prøv igjen.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: "apple" | "google") => {
    Alert.alert(
      "Kommer snart",
      `Innlogging med ${provider === "apple" ? "Apple" : "Google"} er ikke tilgjengelig ennå.`,
    );
  };

  const handleForgotPassword = () => {
    Alert.alert("Glemt passord", "Denne funksjonen er ikke tilgjengelig ennå.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <YStack
            flex={1}
            padding="$xl"
            justifyContent="center"
            gap="$xl"
            maxWidth={440}
            width="100%"
            alignSelf="center"
          >
            {/* Back button — only when navigated from another page */}
            {router.canGoBack() && (
              <XStack>
                <Text
                  color="$primary"
                  fontSize={14}
                  fontWeight="600"
                  onPress={() => router.back()}
                  pressStyle={{ opacity: 0.7 }}
                  cursor="pointer"
                >
                  <Ionicons
                    name="arrow-back"
                    size={16}
                    color={colors.primary}
                  />{" "}
                  Tilbake
                </Text>
              </XStack>
            )}

            {/* Logo */}
            <YStack alignItems="center" gap="$lg">
              <View
                width={80}
                height={80}
                borderRadius="$full"
                backgroundColor="$primaryLight"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="leaf" size={40} color={colors.primary} />
              </View>
              <H1 textAlign="center" color="$textPrimary" fontFamily="$heading">
                Logg inn
              </H1>
            </YStack>

            {/* Form */}
            <YStack gap="$lg">
              <FormField label="E-post">
                <Input
                  placeholder="din@epost.no"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </FormField>

              <FormField label="Passord">
                <Input
                  placeholder="Ditt passord"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </FormField>

              {error ? (
                <Text color="$error" fontSize={14} textAlign="center">
                  {error}
                </Text>
              ) : null}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onPress={handleLogin}
                disabled={isLoading}
                opacity={isLoading ? 0.7 : 1}
              >
                {isLoading ? "Logger inn..." : "Logg inn"}
              </Button>

              <Button variant="ghost" size="sm" onPress={handleForgotPassword}>
                Glemt passord?
              </Button>
            </YStack>

            {/* Divider */}
            <XStack alignItems="center" gap="$md">
              <Separator flex={1} />
              <Text color="$textMuted" fontSize={14}>
                eller
              </Text>
              <Separator flex={1} />
            </XStack>

            {/* Social sign-in */}
            <YStack gap="$md">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onPress={() => handleSocialSignIn("apple")}
                icon={
                  <Ionicons
                    name="logo-apple"
                    size={20}
                    color={colors.primary}
                  />
                }
              >
                Fortsett med Apple
              </Button>
              <Button
                variant="outline"
                size="md"
                fullWidth
                onPress={() => handleSocialSignIn("google")}
                icon={
                  <Ionicons
                    name="logo-google"
                    size={20}
                    color={colors.primary}
                  />
                }
              >
                Fortsett med Google
              </Button>
            </YStack>

            {/* Register link */}
            <XStack justifyContent="center" gap="$sm" paddingTop="$md">
              <Text color="$textSecondary" fontSize={14}>
                Har du ikke konto?
              </Text>
              <Text
                color="$primary"
                fontSize={14}
                fontWeight="600"
                onPress={() => router.push("/(auth)/register")}
                pressStyle={{ opacity: 0.7 }}
                cursor="pointer"
              >
                Registrer deg
              </Text>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
