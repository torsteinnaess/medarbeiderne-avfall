import { Button } from "@/components/ui";
import { Link, Stack } from "expo-router";
import { Text, YStack } from "tamagui";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Fant ikke siden" }} />
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        padding="$xl"
        backgroundColor="$background"
        gap="$lg"
      >
        <Text fontSize={20} fontWeight="700" color="$textPrimary">
          Denne siden finnes ikke
        </Text>
        <Link href="/" asChild>
          <Button variant="primary" size="md">
            Gå til forsiden
          </Button>
        </Link>
      </YStack>
    </>
  );
}
