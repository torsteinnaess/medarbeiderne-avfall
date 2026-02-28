import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
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
import { H1, Text, XStack, YStack } from "tamagui";

function translateAuthError(message: string): string {
  if (message.includes("User already registered")) {
    return "Denne e-postadressen er allerede registrert.";
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

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    if (password.length < 6) {
      setError("Passordet må være minst 6 tegn");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passordene stemmer ikke overens");
      return;
    }

    setIsLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
          phone: phone.trim(),
        },
      },
    });
    setIsLoading(false);

    if (authError) {
      setError(translateAuthError(authError.message));
      return;
    }

    Alert.alert(
      "Konto opprettet",
      "Sjekk e-posten din for å bekrefte kontoen.",
      [{ text: "OK", onPress: () => router.back() }],
    );
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
            {/* Back button */}
            <XStack>
              <Text
                color="$primary"
                fontSize={14}
                fontWeight="600"
                onPress={() => router.back()}
                pressStyle={{ opacity: 0.7 }}
                cursor="pointer"
              >
                <Ionicons name="arrow-back" size={16} color={colors.primary} />{" "}
                Tilbake
              </Text>
            </XStack>

            {/* Header */}
            <YStack alignItems="center" gap="$sm">
              <H1 textAlign="center" color="$textPrimary" fontFamily="$heading">
                Opprett konto
              </H1>
              <Text textAlign="center" color="$textSecondary" fontSize={14}>
                Fyll inn informasjonen under for å komme i gang
              </Text>
            </YStack>

            {/* Form */}
            <YStack gap="$lg">
              <FormField label="Navn">
                <Input
                  placeholder="Ditt fulle navn"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </FormField>

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

              <FormField label="Telefon (valgfritt)">
                <Input
                  placeholder="+47 000 00 000"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </FormField>

              <FormField label="Passord">
                <Input
                  placeholder="Minst 6 tegn"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </FormField>

              <FormField label="Bekreft passord">
                <Input
                  placeholder="Gjenta passordet"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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
                onPress={handleRegister}
                disabled={isLoading}
                opacity={isLoading ? 0.7 : 1}
              >
                {isLoading ? "Oppretter konto..." : "Opprett konto"}
              </Button>
            </YStack>

            {/* Login link */}
            <XStack justifyContent="center" gap="$sm" paddingTop="$md">
              <Text color="$textSecondary" fontSize={14}>
                Har du allerede konto?
              </Text>
              <Text
                color="$primary"
                fontSize={14}
                fontWeight="600"
                onPress={() => router.back()}
                pressStyle={{ opacity: 0.7 }}
                cursor="pointer"
              >
                Logg inn
              </Text>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
