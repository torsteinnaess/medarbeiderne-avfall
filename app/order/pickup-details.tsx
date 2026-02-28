import {
    Button,
    FormField,
    Input,
    StepIndicator,
    TextArea,
} from "@/components/ui";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import type { CarryDistance, PickupDetails, TimeWindow } from "@/lib/types";
import { CARRY_DISTANCES, TIME_WINDOWS } from "@/lib/types";
import { useRouter } from "expo-router";
import { useState } from "react";
import { H2, ScrollView, Switch, Text, XStack, YStack } from "tamagui";

const CARRY_DISTANCE_LABELS: Record<CarryDistance, string> = {
  "0-10m": "0-10m",
  "10-25m": "10-25m",
  "25-50m": "25-50m",
  "50m+": "50m+",
};

const TIME_WINDOW_LABELS: Record<TimeWindow, string> = {
  "08:00-12:00": "08:00-12:00",
  "12:00-16:00": "12:00-16:00",
  "16:00-20:00": "16:00-20:00",
};

function getTomorrow(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function PickupDetailsScreen() {
  const router = useRouter();
  const { pickupDetails, setPickupDetails } = useOrderDraftStore();

  const [address, setAddress] = useState(pickupDetails?.address ?? "");
  const [floor, setFloor] = useState(String(pickupDetails?.floor ?? 1));
  const [hasElevator, setHasElevator] = useState(
    pickupDetails?.has_elevator ?? false,
  );
  const [hasParking, setHasParking] = useState(
    pickupDetails?.has_parking ?? true,
  );
  const [carryDistance, setCarryDistance] = useState<CarryDistance>(
    pickupDetails?.carry_distance ?? "0-10m",
  );
  const [pickupDate, setPickupDate] = useState<Date>(
    pickupDetails?.pickup_date
      ? new Date(pickupDetails.pickup_date)
      : getTomorrow(),
  );
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(
    pickupDetails?.pickup_time_window ?? "08:00-12:00",
  );
  const [notes, setNotes] = useState(pickupDetails?.notes ?? "");

  const canProceed = address.trim().length > 0;

  const handleNext = () => {
    const details: PickupDetails = {
      address: address.trim(),
      lat: 0,
      lng: 0,
      floor: parseInt(floor, 10) || 0,
      has_elevator: hasElevator,
      has_parking: hasParking,
      carry_distance: carryDistance,
      pickup_date: formatDate(pickupDate),
      pickup_time_window: timeWindow,
      notes: notes.trim(),
    };
    setPickupDetails(details);
    router.push("/order/price");
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <StepIndicator currentStep={3} />
      <ScrollView flex={1} contentContainerStyle={{ padding: 24, gap: 20 }}>
        <H2 color="$textPrimary">Hentedetaljer</H2>

        <FormField label="Adresse">
          <Input
            value={address}
            onChangeText={setAddress}
            placeholder="Gateadresse, postnummer, sted"
          />
        </FormField>

        <FormField label="Etasje">
          <Input
            value={floor}
            onChangeText={setFloor}
            keyboardType="numeric"
            placeholder="0"
          />
        </FormField>

        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} fontWeight="500" color="$textPrimary">
            Har heis?
          </Text>
          <Switch
            size="$3"
            checked={hasElevator}
            onCheckedChange={setHasElevator}
            backgroundColor={hasElevator ? "$primary" : "$border"}
          >
            <Switch.Thumb />
          </Switch>
        </XStack>

        <XStack justifyContent="space-between" alignItems="center">
          <Text fontSize={14} fontWeight="500" color="$textPrimary">
            Parkering tilgjengelig?
          </Text>
          <Switch
            size="$3"
            checked={hasParking}
            onCheckedChange={setHasParking}
            backgroundColor={hasParking ? "$primary" : "$border"}
          >
            <Switch.Thumb />
          </Switch>
        </XStack>

        <FormField label="Bæreavstand">
          <XStack gap="$sm" flexWrap="wrap">
            {CARRY_DISTANCES.map((d) => (
              <Button
                key={d}
                variant={carryDistance === d ? "primary" : "outline"}
                size="sm"
                onPress={() => setCarryDistance(d)}
              >
                {CARRY_DISTANCE_LABELS[d]}
              </Button>
            ))}
          </XStack>
        </FormField>

        <FormField label="Hentedato">
          <Input
            value={formatDate(pickupDate)}
            onChangeText={(text: string) => {
              const parsed = new Date(text);
              if (!isNaN(parsed.getTime()) && parsed >= getTomorrow()) {
                setPickupDate(parsed);
              }
            }}
            placeholder="ÅÅÅÅ-MM-DD"
          />
          <Text fontSize={12} color="$textMuted">
            Tidligst {formatDateDisplay(formatDate(getTomorrow()))}
          </Text>
        </FormField>

        <FormField label="Tidspunkt">
          <XStack gap="$sm" flexWrap="wrap">
            {TIME_WINDOWS.map((tw) => (
              <Button
                key={tw}
                variant={timeWindow === tw ? "primary" : "outline"}
                size="sm"
                onPress={() => setTimeWindow(tw)}
              >
                {TIME_WINDOW_LABELS[tw]}
              </Button>
            ))}
          </XStack>
        </FormField>

        <FormField label="Merknader (valgfritt)">
          <TextArea
            value={notes}
            onChangeText={setNotes}
            placeholder="Spesielle instruksjoner for henting..."
          />
        </FormField>
      </ScrollView>

      <YStack
        padding="$xl"
        paddingTop="$md"
        borderTopWidth={1}
        borderTopColor="$border"
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={handleNext}
          disabled={!canProceed}
        >
          Neste
        </Button>
      </YStack>
    </YStack>
  );
}
