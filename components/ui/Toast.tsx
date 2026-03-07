// Global Toast-komponent — viser feilmeldinger og varsler
import { useToastStore } from "@/lib/stores/toast";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text as RNText, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const TOAST_CONFIG: Record<
  string,
  { icon: IoniconsName; bg: string; text: string }
> = {
  error: { icon: "alert-circle", bg: "#FEE2E2", text: colors.error },
  success: { icon: "checkmark-circle", bg: "#DCFCE7", text: colors.success },
  warning: { icon: "warning", bg: "#FEF3C7", text: "#92400E" },
  info: { icon: "information-circle", bg: "#DBEAFE", text: colors.info },
};

export function ToastContainer() {
  const { toasts, dismissToast } = useToastStore();
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          top: insets.top + 8,
          left: 16,
          right: 16,
          bottom: undefined,
          zIndex: 9999,
        },
      ]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => {
        const config = TOAST_CONFIG[toast.type] ?? TOAST_CONFIG.error;
        return (
          <Pressable key={toast.id} onPress={() => dismissToast(toast.id)}>
            <View
              style={[
                styles.toastRow,
                styles.shadow,
                { backgroundColor: config.bg },
              ]}
            >
              <Ionicons name={config.icon} size={22} color={config.text} />
              <RNText
                style={[styles.message, { color: config.text }]}
                numberOfLines={3}
              >
                {toast.message}
              </RNText>
              <Ionicons name="close" size={18} color={config.text} />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  toastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
