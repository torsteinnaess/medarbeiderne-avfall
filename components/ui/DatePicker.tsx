import { Ionicons } from "@expo/vector-icons";
import { Platform, Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { colors } from "@/lib/theme";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
}

export function DatePicker({ value, onChange, minimumDate }: DatePickerProps) {
  if (Platform.OS === "web") {
    return <WebDatePicker value={value} onChange={onChange} minimumDate={minimumDate} />;
  }
  return <NativeDatePicker value={value} onChange={onChange} minimumDate={minimumDate} />;
}

function WebDatePicker({ value, onChange, minimumDate }: DatePickerProps) {
  return (
    <YStack gap="$xs">
      <XStack
        borderWidth={1}
        borderColor="$border"
        borderRadius="$md"
        backgroundColor="$surface"
        alignItems="center"
        paddingHorizontal="$lg"
        overflow="hidden"
        hoverStyle={{ borderColor: "$textMuted" }}
        focusStyle={{ borderColor: "$borderFocus", borderWidth: 2 }}
      >
        <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
        <input
          type="date"
          value={formatDate(value)}
          min={minimumDate ? formatDate(minimumDate) : undefined}
          onChange={(e) => {
            const parsed = new Date(e.target.value + "T00:00:00");
            if (!isNaN(parsed.getTime())) {
              onChange(parsed);
            }
          }}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            backgroundColor: "transparent",
            fontFamily: "Inter, sans-serif",
            fontSize: 16,
            color: colors.textPrimary,
            padding: "12px 12px",
            cursor: "pointer",
          }}
        />
      </XStack>
      <Text fontSize={12} color="$textMuted" fontFamily="$body">
        {formatDateDisplay(value)}
      </Text>
    </YStack>
  );
}

function NativeDatePicker({ value, onChange, minimumDate }: DatePickerProps) {
  const goBack = () => {
    const prev = new Date(value);
    prev.setDate(prev.getDate() - 1);
    if (minimumDate && prev < minimumDate) return;
    onChange(prev);
  };

  const goForward = () => {
    const next = new Date(value);
    next.setDate(next.getDate() + 1);
    onChange(next);
  };

  const canGoBack = !minimumDate || value > minimumDate;

  return (
    <YStack gap="$xs">
      <XStack
        borderWidth={1}
        borderColor="$border"
        borderRadius="$md"
        backgroundColor="$surface"
        alignItems="center"
        justifyContent="space-between"
        paddingHorizontal="$md"
        paddingVertical="$md"
        minHeight={48}
      >
        <Pressable onPress={goBack} disabled={!canGoBack}>
          <XStack
            padding="$sm"
            opacity={canGoBack ? 1 : 0.3}
          >
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </XStack>
        </Pressable>

        <XStack gap="$sm" alignItems="center">
          <Ionicons name="calendar-outline" size={18} color={colors.primary} />
          <Text fontSize={16} fontWeight="500" color="$textPrimary" fontFamily="$body">
            {formatDateDisplay(value)}
          </Text>
        </XStack>

        <Pressable onPress={goForward}>
          <XStack padding="$sm">
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </XStack>
        </Pressable>
      </XStack>
    </YStack>
  );
}

