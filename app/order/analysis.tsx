import { Button, Card, Input, StepIndicator } from "@/components/ui";
import { useAnalyzeImages } from "@/lib/api/hooks";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import { colors } from "@/lib/theme";
import type { AnalyzedItem, WasteCategory } from "@/lib/types";
import { WASTE_CATEGORIES, WASTE_CATEGORY_LABELS } from "@/lib/types";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Image, Platform, Pressable } from "react-native";
import { H2, ScrollView, Spinner, Text, XStack, YStack } from "tamagui";

function CategoryPicker({
  value,
  onChange,
}: {
  value: WasteCategory;
  onChange: (cat: WasteCategory) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <YStack>
      <Pressable onPress={() => setOpen(!open)}>
        <XStack
          paddingHorizontal="$md"
          paddingVertical="$sm"
          borderRadius="$md"
          backgroundColor="$primaryLight"
          alignItems="center"
          gap="$sm"
        >
          <Text fontSize={13} fontWeight="600" color="$primary" flex={1}>
            {WASTE_CATEGORY_LABELS[value]}
          </Text>
          <Ionicons
            name={open ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.primary}
          />
        </XStack>
      </Pressable>
      {open && (
        <YStack
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$border"
          borderRadius="$md"
          marginTop="$xs"
          maxHeight={200}
          overflow="hidden"
        >
          <ScrollView nestedScrollEnabled>
            {WASTE_CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                onPress={() => {
                  onChange(cat);
                  setOpen(false);
                }}
              >
                <XStack
                  paddingHorizontal="$md"
                  paddingVertical="$sm"
                  backgroundColor={
                    cat === value ? "$primaryLight" : "transparent"
                  }
                >
                  <Text
                    fontSize={13}
                    color={cat === value ? "$primary" : "$textPrimary"}
                    fontWeight={cat === value ? "600" : "400"}
                  >
                    {WASTE_CATEGORY_LABELS[cat]}
                  </Text>
                </XStack>
              </Pressable>
            ))}
          </ScrollView>
        </YStack>
      )}
    </YStack>
  );
}

export default function AnalysisScreen() {
  const router = useRouter();
  const { imageUris, analyzedItems, setAnalyzedItems, updateItem, removeItem } =
    useOrderDraftStore();

  const analyzeMutation = useAnalyzeImages();
  const hasStarted = useRef(false);

  const [error, setError] = useState<string | null>(null);

  const isLoading = analyzeMutation.isPending;

  // Konverter lokal URI til base64 data URL som OpenAI kan lese direkte
  const toBase64DataUrl = async (uri: string): Promise<string> => {
    // Allerede en data URL (native kan gi dette)
    if (uri.startsWith("data:")) return uri;

    if (Platform.OS !== "web") {
      // På native: bruk expo-file-system som fungerer pålitelig med lokale URIer
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // Bestem MIME-type fra filendelse
      const ext = uri.split(".").pop()?.toLowerCase() ?? "jpeg";
      const mime = ext === "png" ? "image/png" : "image/jpeg";
      return `data:${mime};base64,${base64}`;
    }

    // Web fallback: bruk fetch + FileReader
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const runAnalysis = async () => {
    setError(null);
    try {
      // Konverter lokale URIer til base64 data URLs
      // OpenAI Vision API aksepterer data:image/...;base64,... direkte
      // Ingen Supabase Storage nødvendig — bilder lastes opp ved checkout
      const base64Urls = await Promise.all(imageUris.map(toBase64DataUrl));

      console.log(
        "[Analysis] Sender",
        base64Urls.length,
        "bilder, lengder:",
        base64Urls.map((u) => u.length),
      );

      const result = await analyzeMutation.mutateAsync(base64Urls);

      if (!result.items || result.items.length === 0) {
        console.warn(
          "[Analysis] Ingen gjenstander funnet — OpenAI returnerte tom liste",
          result._debug,
        );
        setError(
          "Ingen gjenstander ble gjenkjent i bildene. Prøv å ta tydeligere bilder, eller legg til gjenstander manuelt.",
        );
        return;
      }

      setAnalyzedItems(result.items);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Ukjent feil";
      setError(message);
      console.error("[Analysis] Error:", message);
    }
  };

  useEffect(() => {
    if (
      !hasStarted.current &&
      analyzedItems.length === 0 &&
      imageUris.length > 0
    ) {
      hasStarted.current = true;
      runAnalysis();
    }
  }, []);

  const handleUpdateName = (index: number, name: string) => {
    const item = analyzedItems[index];
    updateItem(index, { ...item, name });
  };

  const handleUpdateWeight = (index: number, weightStr: string) => {
    const item = analyzedItems[index];
    const weight = parseFloat(weightStr) || 0;
    updateItem(index, { ...item, estimated_weight_kg: weight });
  };

  const handleUpdateCategory = (index: number, category: WasteCategory) => {
    const item = analyzedItems[index];
    updateItem(index, { ...item, category });
  };

  const handleAddItem = () => {
    const newItem: AnalyzedItem = {
      name: "",
      category: "usortert_avfall",
      estimated_weight_kg: 1,
    };
    setAnalyzedItems([...analyzedItems, newItem]);
  };

  // Loading state
  if (isLoading && analyzedItems.length === 0) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={2} />
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$lg">
          <Spinner size="large" color="$primary" />
          <Text fontSize={16} color="$textSecondary">
            Analyserer bildene dine...
          </Text>
        </YStack>
      </YStack>
    );
  }

  // Error state (no items yet)
  if (error && analyzedItems.length === 0) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <StepIndicator currentStep={2} />
        <YStack
          flex={1}
          alignItems="center"
          justifyContent="center"
          gap="$lg"
          padding="$xl"
        >
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />
          <Text fontSize={16} color="$textPrimary" textAlign="center">
            Kunne ikke analysere bildene.
          </Text>
          <Text fontSize={13} color="$textMuted" textAlign="center">
            {error}
          </Text>
          <Button
            variant="primary"
            size="md"
            onPress={() => {
              hasStarted.current = false;
              runAnalysis();
            }}
          >
            Prøv igjen
          </Button>
          <Button variant="ghost" size="md" onPress={() => handleAddItem()}>
            Legg til manuelt i stedet
          </Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <StepIndicator currentStep={2} />
      <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 16 }}>
        <H2 color="$textPrimary">
          {analyzedItems.length > 0
            ? "Analyseresultater"
            : "Registrer gjenstander"}
        </H2>
        <Text fontSize={14} color="$textSecondary">
          {analyzedItems.length > 0
            ? "Rediger, fjern eller legg til gjenstander etter behov."
            : "Legg til gjenstander du ønsker hentet og velg kategori for hver."}
        </Text>

        {/* Thumbnails of uploaded images */}
        {imageUris.length > 0 && (
          <XStack flexWrap="wrap" gap="$sm">
            {imageUris.map((uri) => (
              <Image
                key={uri}
                source={{ uri }}
                style={{ width: 60, height: 60, borderRadius: 8 }}
                resizeMode="cover"
              />
            ))}
          </XStack>
        )}

        {analyzedItems.map((item, index) => (
          <Card key={index} gap="$md">
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={14} fontWeight="600" color="$textMuted">
                Gjenstand {index + 1}
              </Text>
              <Pressable onPress={() => removeItem(index)}>
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </Pressable>
            </XStack>

            <Input
              value={item.name}
              onChangeText={(text: string) => handleUpdateName(index, text)}
              placeholder="Beskrivelse (f.eks. gammel sofa)"
            />

            <CategoryPicker
              value={item.category}
              onChange={(cat) => handleUpdateCategory(index, cat)}
            />

            <XStack alignItems="center" gap="$md">
              <Input
                flex={1}
                value={String(item.estimated_weight_kg)}
                onChangeText={(text: string) => handleUpdateWeight(index, text)}
                keyboardType="numeric"
                placeholder="Vekt"
              />
              <Text fontSize={14} color="$textSecondary">
                kg
              </Text>
            </XStack>
          </Card>
        ))}

        <Button
          variant="outline"
          size="md"
          fullWidth
          onPress={handleAddItem}
          icon={
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.primary}
            />
          }
        >
          Legg til gjenstand
        </Button>
      </ScrollView>

      <YStack
        padding="$xl"
        paddingTop="$md"
        gap="$md"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push("/order/pickup-details")}
          disabled={analyzedItems.length === 0}
        >
          Neste
        </Button>
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onPress={() => router.back()}
        >
          Tilbake
        </Button>
      </YStack>
    </YStack>
  );
}
