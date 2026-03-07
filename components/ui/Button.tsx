import { getButtonSized } from "@tamagui/get-button-sized";
import type { SizeTokens } from "tamagui";
import { getTokenValue, styled, Button as TamaguiButton, Text } from "tamagui";

const customSizes: Record<string, object> = {
  sm: {
    height: 36,
    paddingHorizontal: "$lg",
    fontSize: 14,
  },
  md: {
    height: 48,
    paddingHorizontal: "$xl",
    fontSize: 16,
  },
  lg: {
    height: 56,
    paddingHorizontal: "$2xl",
    fontSize: 18,
  },
};

export const Button = styled(TamaguiButton, {
  borderRadius: "$md",
  paddingHorizontal: "$xl",
  paddingVertical: "$lg",
  pressStyle: { opacity: 0.85, scale: 0.98 },

  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        color: "#FFFFFF",
      },
      secondary: {
        backgroundColor: "$secondary",
        color: "#FFFFFF",
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: "$primary",
        color: "$primary",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "$primary",
      },
      destructive: {
        backgroundColor: "$error",
        color: "#FFFFFF",
      },
    },
    size: {
      "...size": (val: SizeTokens, extras: Record<string, unknown>) => {
        const key = String(val).replace("$", "");
        if (key in customSizes) {
          return customSizes[key];
        }
        const buttonStyle = getButtonSized(val, extras);
        const gap = getTokenValue(val);
        return { ...buttonStyle, gap };
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});

export const ButtonText = styled(Text, {
  fontFamily: "$body",
  fontWeight: "600",
  textAlign: "center",

  variants: {
    variant: {
      primary: { color: "#FFFFFF" },
      secondary: { color: "#FFFFFF" },
      outline: { color: "$primary" },
      ghost: { color: "$primary" },
      destructive: { color: "#FFFFFF" },
    },
    size: {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    size: "md",
  },
});
