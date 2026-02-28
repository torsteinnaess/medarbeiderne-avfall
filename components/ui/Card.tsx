import { styled, YStack } from 'tamagui';

export const Card = styled(YStack, {
  backgroundColor: '$surface',
  borderRadius: '$md',
  padding: '$lg',
  borderWidth: 1,
  borderColor: '$border',

  variants: {
    elevated: {
      true: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
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

