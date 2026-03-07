import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { colors } from "@/lib/theme";

interface ToggleProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

const TRACK_WIDTH = 50;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const THUMB_MARGIN = 3;
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2;

export function Toggle({ checked, onCheckedChange, label }: ToggleProps) {
  const offset = useSharedValue(checked ? TRAVEL : 0);

  useEffect(() => {
    offset.value = withTiming(checked ? TRAVEL : 0, { duration: 200 });
  }, [checked, offset]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <XStack justifyContent="space-between" alignItems="center">
      <Text fontSize={14} fontWeight="500" color="$textPrimary" fontFamily="$body">
        {label}
      </Text>
      <Pressable
        onPress={() => onCheckedChange(!checked)}
        accessibilityRole="switch"
        accessibilityState={{ checked }}
      >
        <YStack
          width={TRACK_WIDTH}
          height={TRACK_HEIGHT}
          borderRadius={TRACK_HEIGHT / 2}
          backgroundColor={checked ? colors.primary : colors.border}
          justifyContent="center"
          paddingHorizontal={THUMB_MARGIN}
        >
          <Animated.View
            style={[
              {
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: THUMB_SIZE / 2,
                backgroundColor: "#FFFFFF",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                elevation: 2,
              },
              thumbStyle,
            ]}
          />
        </YStack>
      </Pressable>
    </XStack>
  );
}

