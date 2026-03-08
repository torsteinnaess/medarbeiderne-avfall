import { Button, CreatePasswordCard } from "@/components/ui";
import { useAuthStore } from "@/lib/stores/auth";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert, Platform } from "react-native";
import { Separator, Text, YStack } from "tamagui";

export default function AccountScreen() {
  const router = useRouter();
  const { user, profile, signOut } = useAuthStore();
  const needsPassword = user?.user_metadata?.needs_password === true;

  const handleSignOut = async () => {
    if (Platform.OS === "web") {
      if (!window.confirm("Er du sikker på at du vil logge ut?")) return;
      await signOut();
      router.replace("/(tabs)");
    } else {
      Alert.alert("Logg ut", "Er du sikker på at du vil logge ut?", [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Logg ut",
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/(tabs)");
          },
        },
      ]);
    }
  };

  if (!user) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        padding="$xl"
        alignItems="center"
        justifyContent="center"
        gap="$lg"
      >
        <Ionicons name="person-outline" size={64} color={colors.textMuted} />
        <Text fontSize={18} fontWeight="600" color="$textPrimary">
          Logg inn for å se kontoen din
        </Text>
        <Button
          variant="primary"
          size="$md"
          onPress={() => router.push("/(auth)/login")}
        >
          Logg inn
        </Button>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background" padding="$xl" gap="$lg">
      <YStack alignItems="center" gap="$md" paddingVertical="$xl">
        <Ionicons
          name="person-circle-outline"
          size={80}
          color={colors.primary}
        />
        <Text fontSize={20} fontWeight="700" color="$textPrimary">
          {profile?.name ?? "Bruker"}
        </Text>
        <Text fontSize={14} color="$textSecondary">
          {user.email}
        </Text>
      </YStack>

      {needsPassword && <CreatePasswordCard />}

      {profile?.role === "admin" && (
        <>
          <Separator />
          <Button
            variant="secondary"
            size="$md"
            fullWidth
            onPress={() => router.push("/(admin)")}
            icon={<Ionicons name="shield-outline" size={20} color="#FFFFFF" />}
          >
            Admin Dashboard
          </Button>
        </>
      )}

      <Separator />
      <Button
        variant="destructive"
        size="$md"
        fullWidth
        onPress={handleSignOut}
        icon={<Ionicons name="log-out-outline" size={20} color="#FFFFFF" />}
      >
        Logg ut
      </Button>
    </YStack>
  );
}
