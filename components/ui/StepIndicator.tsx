import { Text, XStack, YStack, View } from 'tamagui';

const STEPS = [
  { key: 1, label: 'Bilder' },
  { key: 2, label: 'Analyse' },
  { key: 3, label: 'Henting' },
  { key: 4, label: 'Pris' },
  { key: 5, label: 'Betaling' },
  { key: 6, label: 'Bekreftelse' },
];

interface StepIndicatorProps {
  currentStep: number;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <XStack
      paddingHorizontal="$lg"
      paddingVertical="$md"
      alignItems="center"
      justifyContent="center"
      gap="$xs"
    >
      {STEPS.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = step.key < currentStep;

        return (
          <XStack key={step.key} alignItems="center" gap="$xs">
            <YStack alignItems="center" gap="$xs">
              <View
                width={28}
                height={28}
                borderRadius="$full"
                alignItems="center"
                justifyContent="center"
                backgroundColor={
                  isCompleted
                    ? '$primary'
                    : isActive
                      ? '$primary'
                      : '$border'
                }
              >
                <Text
                  fontSize={12}
                  fontWeight="700"
                  color={isCompleted || isActive ? '#FFFFFF' : '$textMuted'}
                >
                  {isCompleted ? '✓' : step.key}
                </Text>
              </View>
              <Text
                fontSize={10}
                color={isActive ? '$primary' : '$textMuted'}
                fontWeight={isActive ? '600' : '400'}
              >
                {step.label}
              </Text>
            </YStack>

            {index < STEPS.length - 1 && (
              <View
                height={2}
                width={16}
                backgroundColor={isCompleted ? '$primary' : '$border'}
                marginBottom="$lg"
              />
            )}
          </XStack>
        );
      })}
    </XStack>
  );
}

