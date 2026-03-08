import {
  AddressAutocomplete,
  Button,
  DatePicker,
  FormField,
  StepIndicator,
  TextArea,
  Toggle,
  ToggleChipGroup,
} from "@/components/ui";
import { useLastPickupDetails } from "@/lib/api/hooks";
import { useAuthStore } from "@/lib/stores/auth";
import { useOrderDraftStore } from "@/lib/stores/order-draft";
import type { CarryDistance, PickupDetails, TimeWindow } from "@/lib/types";
import { CARRY_DISTANCES, TIME_WINDOWS } from "@/lib/types";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { H2, ScrollView, YStack } from "tamagui";

const FLOOR_OPTIONS = ["0", "1", "2", "3", "4", "5", "6", "7+"] as const;
const FLOOR_LABELS: Record<string, string> = {
  "0": "Kjeller/1.",
  "1": "1. etg",
  "2": "2. etg",
  "3": "3. etg",
  "4": "4. etg",
  "5": "5. etg",
  "6": "6. etg",
  "7+": "7+ etg",
};

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

export default function PickupDetailsScreen() {
  const router = useRouter();
  const { pickupDetails, setPickupDetails } = useOrderDraftStore();
  const session = useAuthStore((s) => s.session);
  const { data: lastPickup } = useLastPickupDetails();
  const hasAppliedLastPickup = useRef(false);

  const [address, setAddress] = useState(pickupDetails?.address ?? "");
  const [lat, setLat] = useState(pickupDetails?.lat ?? 0);
  const [lng, setLng] = useState(pickupDetails?.lng ?? 0);
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
  const [addressTouched, setAddressTouched] = useState(false);

  // Pre-fill from last order if user hasn't already filled in details
  useEffect(() => {
    if (lastPickup && !pickupDetails && !hasAppliedLastPickup.current) {
      hasAppliedLastPickup.current = true;
      setAddress(lastPickup.address);
      setLat(lastPickup.lat);
      setLng(lastPickup.lng);
      setFloor(String(lastPickup.floor));
      setHasElevator(lastPickup.has_elevator);
      setHasParking(lastPickup.has_parking);
      setCarryDistance(lastPickup.carry_distance);
      setTimeWindow(lastPickup.pickup_time_window);
      setNotes(lastPickup.notes);
    }
  }, [lastPickup, pickupDetails]);

  const canProceed = address.trim().length > 0;
  const addressError =
    addressTouched && !canProceed ? "Adresse er påkrevd" : undefined;

  const handleNext = () => {
    if (!canProceed) {
      setAddressTouched(true);
      return;
    }
    const details: PickupDetails = {
      address: address.trim(),
      lat,
      lng,
      floor: parseInt(floor, 10) || 0,
      has_elevator: hasElevator,
      has_parking: hasParking,
      carry_distance: carryDistance,
      pickup_date: formatDate(pickupDate),
      pickup_time_window: timeWindow,
      notes: notes.trim(),
    };
    setPickupDetails(details);

    if (!session) {
      router.push("/(auth)/register?returnTo=checkout");
      return;
    }

    router.push("/order/checkout");
  };

  return (
    <YStack flex={1} backgroundColor="$background">
      <StepIndicator currentStep={3} />
      <ScrollView
        flex={1}
        contentContainerStyle={{
          padding: 24,
          gap: 20,
          maxWidth: 600,
          width: "100%",
          alignSelf: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <H2 color="$textPrimary">Hentedetaljer</H2>

        <FormField label="Adresse" error={addressError}>
          <AddressAutocomplete
            value={address}
            onSelect={(result) => {
              setAddress(result.address);
              setLat(result.lat);
              setLng(result.lng);
              setAddressTouched(false);
            }}
            placeholder="Søk etter adresse..."
            error={!!addressError}
          />
        </FormField>

        <FormField label="Etasje">
          <ToggleChipGroup
            options={[...FLOOR_OPTIONS]}
            labels={FLOOR_LABELS}
            value={floor}
            onChange={setFloor}
          />
        </FormField>

        <Toggle
          label="Har heis?"
          checked={hasElevator}
          onCheckedChange={setHasElevator}
        />

        <Toggle
          label="Parkering tilgjengelig?"
          checked={hasParking}
          onCheckedChange={setHasParking}
        />

        <FormField label="Bæreavstand">
          <ToggleChipGroup
            options={CARRY_DISTANCES}
            labels={CARRY_DISTANCE_LABELS}
            value={carryDistance}
            onChange={setCarryDistance}
          />
        </FormField>

        <FormField label="Hentedato">
          <DatePicker
            value={pickupDate}
            onChange={setPickupDate}
            minimumDate={getTomorrow()}
          />
        </FormField>

        <FormField label="Tidspunkt">
          <ToggleChipGroup
            options={TIME_WINDOWS}
            labels={TIME_WINDOW_LABELS}
            value={timeWindow}
            onChange={setTimeWindow}
          />
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
        maxWidth={600}
        width="100%"
        alignSelf="center"
      >
        <Button variant="primary" size="lg" fullWidth onPress={handleNext}>
          Neste
        </Button>
      </YStack>
    </YStack>
  );
}
