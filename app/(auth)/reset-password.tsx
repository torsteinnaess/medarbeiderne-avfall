import { Button } from "@/components/ui/Button";
import { FormField, Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import {
    getUserFriendlyErrorMessage,
    isNetworkError,
} from "@/lib/utils/network-error";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1, Text, View, XStack, YStack } from "tamagui";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async () => {
    setError("");

    if (!email.trim()) {
      setError("Vennligst fyll inn e-post");
      return;
    }

    setIsLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }

      setIsSent(true);
    } catch (e) {
      if (isNetworkError(e)) {
        setError(getUserFriendlyErrorMessage(e));
      } else {
        setError("Noe gikk galt. Prøv igjen.");
      }
    } finally {
      setIsLoading(false);
    }
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

            <YStack alignItems="center" gap="$lg">
              <View
                width={80}
                height={80}
                borderRadius="$full"
                backgroundColor="$primaryLight"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons
                  name="lock-open-outline"
                  size={40}
                  color={colors.primary}
                />
              </View>
              <H1 textAlign="center" color="$textPrimary" fontFamily="$heading">
                Glemt passord
              </H1>
            </YStack>

            {isSent ? (
              <YStack gap="$lg" alignItems="center">
                <View
                  width={64}
                  height={64}
                  borderRadius="$full"
                  backgroundColor="$successLight"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons
                    name="mail-outline"
                    size={32}
                    color={colors.success}
                  />
                </View>
                <Text
                  fontSize={16}
                  fontWeight="600"
                  color="$textPrimary"
                  textAlign="center"
                >
                  E-post sendt!
                </Text>
                <Text
                  fontSize={14}
                  color="$textSecondary"
                  textAlign="center"
                  lineHeight={22}
                >
                  Sjekk innboksen din for en lenke til å tilbakestille
                  passordet. Sjekk også søppelpost-mappen.
                </Text>
                <Button
                  variant="outline"
                  size="$md"
                  fullWidth
                  onPress={() => router.back()}
                >
                  Tilbake til innlogging
                </Button>
              </YStack>
            ) : (
              <YStack gap="$lg">
                <Text fontSize={14} color="$textSecondary" textAlign="center">
                  Skriv inn e-postadressen din, så sender vi deg en lenke for å
                  tilbakestille passordet.
                </Text>

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

                {error ? (
                  <Text color="$error" fontSize={14} textAlign="center">
                    {error}
                  </Text>
                ) : null}

                <Button
                  variant="primary"
                  size="$lg"
                  fullWidth
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  opacity={isLoading ? 0.7 : 1}
                >
                  {isLoading ? "Sender..." : "Send tilbakestillingslenke"}
                </Button>
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
