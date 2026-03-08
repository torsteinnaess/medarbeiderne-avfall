import { styled, YStack } from "tamagui";

export const Card = styled(YStack, {
  backgroundColor: "$surface",
  borderRadius: "$md",
  padding: "$lg",
  borderWidth: 1,
  borderColor: "$border",

  variants: {
    elevated: {
      true: {
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        elevation: 3,
        borderWidth: 0,
      },
    },
    pressable: {
      true: {
        pressStyle: {
          scale: 0.98,
          opacity: 0.9,
        },
      },
    },
  } as const,
});
