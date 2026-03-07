import {
    styled,
    Input as TamaguiInput,
    TextArea as TamaguiTextArea,
    Text,
    YStack,
} from "tamagui";

export const Input = styled(TamaguiInput, {
  fontFamily: "$body",
  fontSize: 16,
  height: 48,
  borderWidth: 1,
  borderColor: "$border",
  borderRadius: "$md",
  paddingHorizontal: "$lg",
  backgroundColor: "$surface",
  color: "$textPrimary",
  placeholderTextColor: "$textMuted",

  focusStyle: {
    borderColor: "$borderFocus",
    borderWidth: 2,
  },

  variants: {
    error: {
      true: {
        borderColor: "$error",
        focusStyle: {
          borderColor: "$error",
        },
      },
    },
  } as const,
});

export const TextArea = styled(TamaguiTextArea, {
  fontFamily: "$body",
  fontSize: 16,
  minHeight: 100,
  borderWidth: 1,
  borderColor: "$border",
  borderRadius: "$md",
  paddingHorizontal: "$lg",
  paddingVertical: "$md",
  backgroundColor: "$surface",
  color: "$textPrimary",
  placeholderTextColor: "$textMuted",

  focusStyle: {
    borderColor: "$borderFocus",
    borderWidth: 2,
  },
});

const ErrorText = styled(Text, {
  fontSize: 13,
  color: "$error",
  fontFamily: "$body",
  marginTop: "$xs",
});

const Label = styled(Text, {
  fontSize: 14,
  fontWeight: "500",
  color: "$textPrimary",
  fontFamily: "$body",
  marginBottom: "$xs",
});

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  style?: Record<string, string | number>;
}

export function FormField({ label, error, children, style }: FormFieldProps) {
  return (
    <YStack gap="$xs" style={style}>
      <Label>{label}</Label>
      {children}
      {error && <ErrorText>{error}</ErrorText>}
    </YStack>
  );
}
