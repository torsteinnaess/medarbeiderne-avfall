import { styled, Button as TamaguiButton, Text } from "tamagui";

export const Button = styled(TamaguiButton, {
  borderRadius: "$md",
  paddingHorizontal: "$xl",
  fontFamily: "$body",
  fontWeight: "600",
  pressStyle: { opacity: 0.85, scale: 0.98 },

  variants: {
    variant: {
      primary: {
        backgroundColor: "$primary",
        color: "#FFFFFF",
        hoverStyle: { backgroundColor: "$primaryDark" },
      },
      secondary: {
        backgroundColor: "$secondary",
        color: "#FFFFFF",
        hoverStyle: { backgroundColor: "$secondaryLight" },
      },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: "$primary",
        color: "$primary",
        hoverStyle: { backgroundColor: "$primaryLight" },
      },
      ghost: {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: "$border",
        color: "$primary",
        hoverStyle: {
          backgroundColor: "$primaryLight",
          borderColor: "$primary",
        },
      },
      destructive: {
        backgroundColor: "$error",
        color: "#FFFFFF",
        hoverStyle: { backgroundColor: "#C62828" },
      },
    },
    size: {
      $sm: {
        height: 36,
        paddingHorizontal: "$lg",
        fontSize: 14,
      },
      $md: {
        height: 48,
        paddingHorizontal: "$xl",
        fontSize: 16,
      },
      $lg: {
        height: 56,
        paddingHorizontal: "$2xl",
        fontSize: 18,
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
    size: "$md",
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
      $sm: { fontSize: 14 },
      $md: { fontSize: 16 },
      $lg: { fontSize: 18 },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
    size: "$md",
  },
});
