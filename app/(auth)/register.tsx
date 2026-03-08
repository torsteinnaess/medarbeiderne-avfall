import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { StepIndicator } from "@/components/ui/StepIndicator";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import {
    getUserFriendlyErrorMessage,
    isNetworkError,
} from "@/lib/utils/network-error";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1, H2, Text, View, XStack, YStack } from "tamagui";

function translateAuthError(message: string, isOrderFlow = false): string {
  if (message.includes("User already registered")) {
    return isOrderFlow
      ? "Denne e-postadressen er allerede registrert. Trykk «Logg inn» under."
      : "Denne e-postadressen er allerede registrert.";
  }
  if (message.includes("Password should be at least")) {
    return "Passordet må være minst 6 tegn.";
  }
  if (message.includes("Unable to validate email")) {
    return "Ugyldig e-postadresse.";
  }
  if (message.includes("Too many requests")) {
    return "For mange forsøk. Prøv igjen senere.";
  }
  return "Noe gikk galt. Prøv igjen.";
}

function generateRandomPassword(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const isOrderFlow = returnTo === "checkout";

  const handleRegister = async () => {
    setError("");

    if (!name.trim()) {
      setError("Vennligst fyll inn navn");
      return;
    }
    if (!email.trim()) {
      setError("Vennligst fyll inn e-post");
      return;
    }
    if (!phone.trim()) {
      setError("Vennligst fyll inn telefonnummer");
      return;
    }

    // In order flow, password is optional — generate one behind the scenes
    const finalPassword = isOrderFlow ? generateRandomPassword() : password;

    if (!isOrderFlow) {
      if (finalPassword.length < 6) {
        setError("Passordet må være minst 6 tegn");
        return;
      }
      if (finalPassword !== confirmPassword) {
        setError("Passordene stemmer ikke overens");
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: finalPassword,
        options: {
          data: {
            name: name.trim(),
            phone: `+47${phone.trim()}`,
            ...(isOrderFlow && { needs_password: true }),
          },
        },
      });

      if (authError) {
        setError(translateAuthError(authError.message, isOrderFlow));
        return;
      }

      // With autoconfirm enabled, the user is now logged in.
      // If they were in the order flow, continue to checkout.
      if (isOrderFlow) {
        router.replace("/order/checkout");
      } else {
        router.back();
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

  const formFields = (
    <>
      <FormField label="Navn" required>
        <Input
          placeholder="Ditt fulle navn"
          value={name}
          onChangeText={setName}
          autoCapitalize="sentences"
          autoCorrect={false}
        />
      </FormField>

      <FormField label="E-post" required>
        <Input
          placeholder="din@epost.no"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </FormField>

      <FormField label="Telefon" required>
        <XStack gap="$sm" alignItems="center">
          <XStack
            height={48}
            paddingHorizontal="$lg"
            borderWidth={1}
            borderColor="$border"
            borderRadius="$md"
            backgroundColor="$surface"
            alignItems="center"
            gap="$xs"
          >
            <Text fontSize={18}>🇳🇴</Text>
            <Text fontSize={16} color="$textPrimary" fontFamily="$body">
              +47
            </Text>
          </XStack>
          <Input
            flex={1}
            placeholder="000 00 000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </XStack>
      </FormField>

      {!isOrderFlow && (
        <>
          <FormField label="Passord" required>
            <Input
              placeholder="Minst 6 tegn"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </FormField>

          <FormField label="Bekreft passord" required>
            <Input
              placeholder="Gjenta passordet"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </FormField>
        </>
      )}

      {error ? (
        <Text color="$error" fontSize={14} textAlign="center">
          {error}
        </Text>
      ) : null}
    </>
  );

  const loginLink = (
    <XStack justifyContent="center" gap="$sm" paddingTop="$md">
      <Text color="$textSecondary" fontSize={14}>
        Har du allerede konto?
      </Text>
      <Text
        color="$primary"
        fontSize={14}
        fontWeight="600"
        onPress={() =>
          router.push(`/(auth)/login${returnTo ? `?returnTo=${returnTo}` : ""}`)
        }
        pressStyle={{ opacity: 0.7 }}
        cursor="pointer"
      >
        Logg inn
      </Text>
    </XStack>
  );

  // ── Order Flow Mode ──
  // Matches the order flow screens (StepIndicator, same layout structure)
  if (isOrderFlow) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={3} />
        <ScrollView
          flex={1}
          contentContainerStyle={{
            padding: 24,
            gap: 20,
            maxWidth: 600,
            width: "100%",
            alignSelf: "center",
          }}
          keyboardShouldPersistTaps="handled"
        >
          <H2 color="$textPrimary">Kontaktinfo</H2>
          <Text fontSize={14} color="$textSecondary">
            Vi trenger litt info for å fullføre bestillingen
          </Text>

          <YStack gap="$lg">{formFields}</YStack>
        </ScrollView>

        <YStack
          padding="$xl"
          paddingTop="$md"
          gap="$md"
          borderTopWidth={1}
          borderTopColor="$border"
          maxWidth={600}
          width="100%"
          alignSelf="center"
        >
          <Button
            variant="primary"
            size="$lg"
            fullWidth
            onPress={handleRegister}
            disabled={isLoading}
            opacity={isLoading ? 0.7 : 1}
          >
            {isLoading ? "Fortsetter..." : "Fortsett til pris"}
          </Button>
          {loginLink}
        </YStack>
      </YStack>
    );
  }

  // ── Standalone Mode ──
  // Matches the login page design and layout
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

            {/* Logo — matches login page */}
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
                Opprett konto
              </H1>
            </YStack>

            {/* Form */}
            <YStack gap="$lg">
              {formFields}

              <Button
                variant="primary"
                size="$lg"
                fullWidth
                onPress={handleRegister}
                disabled={isLoading}
                opacity={isLoading ? 0.7 : 1}
              >
                {isLoading ? "Oppretter konto..." : "Opprett konto"}
              </Button>
            </YStack>

            {/* Login link */}
            {loginLink}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
