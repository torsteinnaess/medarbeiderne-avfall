import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable } from "react-native";
import { Input, Text, XStack, YStack } from "tamagui";
import { colors } from "@/lib/theme";

interface AddressSuggestion {
  adressetekst: string;
  postnummer: string;
  poststed: string;
  representasjonspunkt?: {
    lat: number;
    lon: number;
  };
}

interface AddressResult {
  address: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
}

export function AddressAutocomplete({
  value,
  onSelect,
  placeholder = "Søk etter adresse...",
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchAddresses = useCallback(async (text: string) => {
    if (text.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const url = `https://ws.geonorge.no/adresser/v1/sok?sok=${encodeURIComponent(text)}&fuzzy=true&treffPerSide=5&utkoordsys=4258`;
      const response = await fetch(url);
      const data = await response.json();
      setSuggestions(data.adresser ?? []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setQuery(text);
    setShowSuggestions(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddresses(text), 300);
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    const fullAddress = `${suggestion.adressetekst}, ${suggestion.postnummer} ${suggestion.poststed}`;
    setQuery(fullAddress);
    setShowSuggestions(false);
    setSuggestions([]);
    onSelect({
      address: fullAddress,
      lat: suggestion.representasjonspunkt?.lat ?? 0,
      lng: suggestion.representasjonspunkt?.lon ?? 0,
    });
  };

  return (
    <YStack position="relative" zIndex={100}>
      <XStack alignItems="center" position="relative">
        <Input
          flex={1}
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          fontFamily="$body"
          fontSize={16}
          borderWidth={1}
          borderColor="$border"
          borderRadius="$md"
          paddingHorizontal="$lg"
          paddingVertical="$md"
          paddingRight={40}
          backgroundColor="$surface"
          color="$textPrimary"
          placeholderTextColor="$textMuted"
          focusStyle={{ borderColor: "$borderFocus", borderWidth: 2 }}
        />
        <XStack
          position="absolute"
          right={12}
          top={0}
          bottom={0}
          alignItems="center"
          pointerEvents="none"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="search" size={18} color={colors.textMuted} />
          )}
        </XStack>
      </XStack>

      {showSuggestions && suggestions.length > 0 && (
        <YStack
          position="absolute"
          top="100%"
          left={0}
          right={0}
          backgroundColor="$surface"
          borderWidth={1}
          borderColor="$border"
          borderRadius="$md"
          marginTop={4}
          overflow="hidden"
          elevation={4}
          {...(Platform.OS === "web" ? { style: { boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } } : {})}
          zIndex={101}
        >
          {suggestions.map((s, i) => (
            <Pressable key={`${s.adressetekst}-${i}`} onPress={() => handleSelect(s)}>
              <XStack
                paddingHorizontal="$lg"
                paddingVertical="$md"
                gap="$sm"
                alignItems="center"
                borderBottomWidth={i < suggestions.length - 1 ? 1 : 0}
                borderBottomColor="$border"
                hoverStyle={{ backgroundColor: "$surfaceHover" }}
              >
                <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                <YStack flex={1}>
                  <Text fontSize={14} color="$textPrimary" fontFamily="$body">
                    {s.adressetekst}
                  </Text>
                  <Text fontSize={12} color="$textMuted" fontFamily="$body">
                    {s.postnummer} {s.poststed}
                  </Text>
                </YStack>
              </XStack>
            </Pressable>
          ))}
        </YStack>
      )}
    </YStack>
  );
}

