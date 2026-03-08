import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField, Input } from "@/components/ui/Input";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import {
    getUserFriendlyErrorMessage,
    isNetworkError,
} from "@/lib/utils/network-error";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, View, YStack } from "tamagui";

export function CreatePasswordCard() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleCreatePassword = async () => {
    setError("");

    if (password.length < 6) {
      setError("Passordet må være minst 6 tegn");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passordene stemmer ikke overens");
      return;
    }

    setIsLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
        data: { needs_password: false },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setIsDone(true);
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

  if (isDone) {
    return (
      <Card gap="$md" width="100%">
        <YStack alignItems="center" gap="$sm">
          <View
            width={40}
            height={40}
            borderRadius="$full"
            backgroundColor="$successLight"
            alignItems="center"
            justifyContent="center"
          >
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.success}
            />
          </View>
          <Text fontSize={16} fontWeight="600" color="$textPrimary">
            Passord opprettet!
          </Text>
          <Text fontSize={13} color="$textSecondary" textAlign="center">
            Du kan nå logge inn med e-post og passord.
          </Text>
        </YStack>
      </Card>
    );
  }

  return (
    <Card gap="$md" width="100%">
      <YStack gap="$sm">
        <Text fontSize={16} fontWeight="600" color="$textPrimary">
          Opprett passord
        </Text>
        <Text fontSize={13} color="$textSecondary">
          Lag et passord så du enkelt kan logge inn igjen senere.
        </Text>
      </YStack>

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
        <Text color="$error" fontSize={13} textAlign="center">
          {error}
        </Text>
      ) : null}

      <Button
        variant="primary"
        size="$md"
        fullWidth
        onPress={handleCreatePassword}
        disabled={isLoading}
        opacity={isLoading ? 0.7 : 1}
      >
        {isLoading ? "Oppretter..." : "Opprett passord"}
      </Button>
    </Card>
  );
}
