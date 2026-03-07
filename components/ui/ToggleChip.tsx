import { Pressable } from "react-native";
import { Text, XStack } from "tamagui";

interface ToggleChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function ToggleChip({ label, selected, onPress }: ToggleChipProps) {
  return (
    <Pressable onPress={onPress}>
      <XStack
        paddingHorizontal="$lg"
        paddingVertical="$sm"
        borderRadius="$full"
        borderWidth={1.5}
        borderColor={selected ? "$primary" : "$border"}
        backgroundColor={selected ? "$primaryLight" : "$surface"}
        alignItems="center"
        justifyContent="center"
        minHeight={38}
        hoverStyle={{
          borderColor: selected ? "$primary" : "$textMuted",
        }}
        pressStyle={{
          opacity: 0.85,
          scale: 0.97,
        }}
      >
        <Text
          fontSize={14}
          fontWeight={selected ? "600" : "400"}
          color={selected ? "$primaryDark" : "$textSecondary"}
          fontFamily="$body"
        >
          {label}
        </Text>
      </XStack>
    </Pressable>
  );
}

interface ToggleChipGroupProps<T extends string> {
  options: readonly T[];
  labels: Record<T, string>;
  value: T;
  onChange: (value: T) => void;
}

export function ToggleChipGroup<T extends string>({
  options,
  labels,
  value,
  onChange,
}: ToggleChipGroupProps<T>) {
  return (
    <XStack gap="$sm" flexWrap="wrap">
      {options.map((option) => (
        <ToggleChip
          key={option}
          label={labels[option]}
          selected={value === option}
          onPress={() => onChange(option)}
        />
      ))}
    </XStack>
  );
}

