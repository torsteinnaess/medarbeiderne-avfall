import { Button, StepIndicator } from "@/components/ui";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Platform, Pressable } from "react-native";
import { H2, ScrollView, Text, View, XStack, YStack } from "tamagui";

const MAX_IMAGES = 10;

const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  quality: 0.7,
  mediaTypes: ["images"],
  allowsMultipleSelection: true,
  selectionLimit: MAX_IMAGES,
};

export default function UploadScreen() {
  const router = useRouter();
  const { imageUris, addImageUri, removeImageUri } = useOrderDraftStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = MAX_IMAGES - imageUris.length;

  const handleCamera = async () => {
    try {
      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== "granted") {
          setError("Vi trenger tilgang til kameraet for å ta bilder.");
          return;
        }
      }
      setIsLoading(true);
      setError(null);
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        mediaTypes: ["images"],
      });
      if (!result.canceled && result.assets.length > 0) {
        addImageUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Kunne ikke åpne kamera. Prøv «Velg fra album» i stedet.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGallery = async () => {
    try {
      if (Platform.OS !== "web") {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (perm.status !== "granted") {
          setError("Vi trenger tilgang til bildebiblioteket.");
          return;
        }
      }
      setIsLoading(true);
      setError(null);
      const result = await ImagePicker.launchImageLibraryAsync({
        ...IMAGE_OPTIONS,
        selectionLimit: remaining,
      });
      if (!result.canceled) {
        result.assets.forEach((asset) => {
          if (imageUris.length < MAX_IMAGES) {
            addImageUri(asset.uri);
          }
        });
      }
    } catch (err) {
      console.error("Gallery error:", err);
      setError("Kunne ikke åpne bildebibliotek.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <StepIndicator currentStep={1} />
      <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 16 }}>
        <H2 color="$textPrimary">Last opp bilder av avfallet</H2>
        <Text fontSize={14} color="$textSecondary">
          Ta eller velg bilder av gjenstandene du ønsker hentet. Minimum 1, maks{" "}
          {MAX_IMAGES} bilder.
        </Text>

        {imageUris.length > 0 && (
          <XStack flexWrap="wrap" gap="$md">
            {imageUris.map((uri) => (
              <View
                key={uri}
                width={100}
                height={100}
                borderRadius="$md"
                overflow="hidden"
              >
                <Image
                  source={{ uri }}
                  style={{ width: 100, height: 100 }}
                  resizeMode="cover"
                />
                <Pressable
                  onPress={() => removeImageUri(uri)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </XStack>
        )}

        <Text fontSize={13} color="$textMuted">
          {imageUris.length} av {MAX_IMAGES} bilder valgt
        </Text>

        {error && (
          <Text fontSize={13} color="$error">
            {error}
          </Text>
        )}

        <YStack gap="$md">
          <Button
            variant="outline"
            size="md"
            fullWidth
            onPress={handleCamera}
            disabled={remaining <= 0 || isLoading}
            icon={
              <Ionicons
                name="camera-outline"
                size={20}
                color={colors.primary}
              />
            }
          >
            Ta bilde
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            onPress={handleGallery}
            disabled={remaining <= 0 || isLoading}
            icon={
              <Ionicons
                name="images-outline"
                size={20}
                color={colors.primary}
              />
            }
          >
            Velg fra album
          </Button>
        </YStack>
      </ScrollView>

      <YStack
        padding="$xl"
        paddingTop="$md"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push("/order/analysis")}
          disabled={imageUris.length === 0}
        >
          Neste
        </Button>
      </YStack>
    </YStack>
  );
}
