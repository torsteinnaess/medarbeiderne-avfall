import { Button, Card } from "@/components/ui";
import { colors } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { H1, H2, H3, Text, View, XStack, YStack } from "tamagui";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const HOMEPAGE_CATEGORIES: { icon: IoniconsName; label: string }[] = [
  { icon: "leaf-outline", label: "Hageavfall" },
  { icon: "construct-outline", label: "Treverk & bygg" },
  { icon: "laptop-outline", label: "Elektronikk" },
  { icon: "hardware-chip-outline", label: "Metall & jern" },
  { icon: "document-outline", label: "Papir & papp" },
  { icon: "trash-outline", label: "Restavfall" },
];

const STEPS = [
  {
    icon: "camera-outline" as IoniconsName,
    emoji: "📸",
    title: "Ta bilde",
    description: "Fotografer avfallet med mobilen",
  },
  {
    icon: "pricetag-outline" as IoniconsName,
    emoji: "💰",
    title: "Få pris",
    description: "AI analyserer og beregner prisen",
  },
  {
    icon: "car-outline" as IoniconsName,
    emoji: "🚛",
    title: "Vi henter",
    description: "Vi kommer til deg og henter alt",
  },
];

const PRICING_EXAMPLES = [
  {
    label: "Hageavfall",
    price: "fra 249 kr",
    icon: "leaf-outline" as IoniconsName,
  },
  { label: "Møbler", price: "fra 399 kr", icon: "bed-outline" as IoniconsName },
  {
    label: "Elektronikk",
    price: "fra 499 kr",
    icon: "laptop-outline" as IoniconsName,
  },
];

const TRUST_STATS = [
  {
    value: "500+",
    label: "Hentinger",
    icon: "checkmark-circle-outline" as IoniconsName,
  },
  { value: "4.8", label: "Vurdering", icon: "star-outline" as IoniconsName },
  { value: "24t", label: "Levering", icon: "time-outline" as IoniconsName },
];

function Section({
  children,
  maxWidth = 800,
}: {
  children: React.ReactNode;
  maxWidth?: number;
}) {
  return (
    <YStack padding="$xl" width="100%" maxWidth={maxWidth} alignSelf="center">
      {children}
    </YStack>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const howItWorksY = useRef(0);

  const scrollToHowItWorks = () => {
    scrollViewRef.current?.scrollTo({ y: howItWorksY.current, animated: true });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero with gradient */}
        <LinearGradient
          colors={[colors.primaryDark, colors.primary, "#4CAF50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: "100%" }}
        >
          <YStack
            padding="$xl"
            paddingTop="$4xl"
            paddingBottom="$3xl"
            gap="$lg"
            alignItems="center"
            maxWidth={800}
            alignSelf="center"
            width="100%"
          >
            <View
              width={96}
              height={96}
              borderRadius="$full"
              backgroundColor="rgba(255,255,255,0.2)"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="leaf" size={48} color="#FFFFFF" />
            </View>
            <H1
              textAlign="center"
              color="#FFFFFF"
              fontFamily="$heading"
              fontSize={34}
              $md={{ fontSize: 42 }}
            >
              Vi henter søppelet ditt
            </H1>
            <Text
              textAlign="center"
              color="rgba(255,255,255,0.9)"
              fontSize={17}
              lineHeight={26}
              maxWidth={400}
            >
              Ta bilde av avfallet, få pris på sekunder, og vi kommer og henter
              — enkelt, raskt og miljøvennlig.
            </Text>
            <YStack gap="$md" width="100%" maxWidth={400} marginTop="$md">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                backgroundColor="#FFFFFF"
                borderColor="#FFFFFF"
                color={colors.primaryDark}
                onPress={() => router.push("/order/upload")}
              >
                Bestill henting
              </Button>
              <Button
                variant="ghost"
                size="md"
                fullWidth
                color="#FFFFFF"
                onPress={scrollToHowItWorks}
              >
                Se hvordan det fungerer ↓
              </Button>
            </YStack>
          </YStack>
        </LinearGradient>

        {/* How it works */}
        <View
          onLayout={(e) => {
            howItWorksY.current = e.nativeEvent.layout.y;
          }}
        >
          <Section>
            <YStack gap="$xl">
              <H2 color="$textPrimary" fontFamily="$heading" textAlign="center">
                Slik fungerer det
              </H2>
              <YStack gap="$lg" $md={{ flexDirection: "row", gap: "$xl" }}>
                {STEPS.map((step, index) => (
                  <YStack key={index} flex={1} alignItems="center" gap="$md">
                    <View
                      width={64}
                      height={64}
                      borderRadius="$full"
                      backgroundColor="$primaryLight"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={28}>{step.emoji}</Text>
                    </View>
                    <YStack alignItems="center" gap="$xs">
                      <Text fontWeight="700" fontSize={17} color="$textPrimary">
                        {index + 1}. {step.title}
                      </Text>
                      <Text
                        fontSize={14}
                        color="$textSecondary"
                        textAlign="center"
                        maxWidth={220}
                      >
                        {step.description}
                      </Text>
                    </YStack>
                    {index < STEPS.length - 1 && (
                      <View height={24} $md={{ display: "none" }}>
                        <Ionicons
                          name="chevron-down"
                          size={20}
                          color={colors.textMuted}
                        />
                      </View>
                    )}
                  </YStack>
                ))}
              </YStack>
            </YStack>
          </Section>
        </View>

        {/* Categories */}
        <Section>
          <YStack gap="$xl">
            <H2 color="$textPrimary" fontFamily="$heading" textAlign="center">
              Hva vi henter
            </H2>
            <XStack flexWrap="wrap" gap="$md" justifyContent="center">
              {HOMEPAGE_CATEGORIES.map((cat) => (
                <Card
                  key={cat.label}
                  width="30%"
                  alignItems="center"
                  padding="$lg"
                  gap="$sm"
                  pressable
                >
                  <View
                    width={48}
                    height={48}
                    borderRadius="$full"
                    backgroundColor="$primaryLight"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons
                      name={cat.icon}
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <Text
                    fontSize={13}
                    fontWeight="500"
                    color="$textPrimary"
                    textAlign="center"
                  >
                    {cat.label}
                  </Text>
                </Card>
              ))}
            </XStack>
          </YStack>
        </Section>

        {/* Pricing teaser */}
        <Section>
          <YStack gap="$xl">
            <H2 color="$textPrimary" fontFamily="$heading" textAlign="center">
              Transparent prising
            </H2>
            <XStack gap="$lg" $sm={{ flexDirection: "column", gap: "$md" }}>
              {PRICING_EXAMPLES.map((item) => (
                <Card key={item.label} elevated flex={1} padding="$xl">
                  <YStack alignItems="center" gap="$md">
                    <View
                      width={48}
                      height={48}
                      borderRadius="$full"
                      backgroundColor="$primaryLight"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons
                        name={item.icon}
                        size={24}
                        color={colors.primary}
                      />
                    </View>
                    <Text fontWeight="600" fontSize={16} color="$textPrimary">
                      {item.label}
                    </Text>
                    <Text fontWeight="800" fontSize={22} color="$primary">
                      {item.price}
                    </Text>
                  </YStack>
                </Card>
              ))}
            </XStack>
            <Text
              fontSize={13}
              color="$textSecondary"
              textAlign="center"
              lineHeight={20}
            >
              Endelig pris beregnes av AI basert på bilder. Du ser alltid prisen
              før du bestiller.
            </Text>
          </YStack>
        </Section>

        {/* Trust signals */}
        <Section>
          <YStack gap="$xl">
            <Card elevated padding="$xl">
              <XStack justifyContent="space-around" flexWrap="wrap" gap="$lg">
                {TRUST_STATS.map((stat) => (
                  <YStack key={stat.label} alignItems="center" gap="$sm">
                    <Ionicons
                      name={stat.icon}
                      size={24}
                      color={colors.primary}
                    />
                    <Text fontSize={32} fontWeight="800" color="$primary">
                      {stat.value}
                    </Text>
                    <Text fontSize={13} color="$textSecondary">
                      {stat.label}
                    </Text>
                  </YStack>
                ))}
              </XStack>
            </Card>

            {/* Testimonial placeholder */}
            <Card padding="$xl" backgroundColor="$primaryLight">
              <YStack gap="$md" alignItems="center">
                <Ionicons
                  name="chatbubble-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text
                  fontSize={15}
                  fontStyle="italic"
                  color="$textPrimary"
                  textAlign="center"
                  lineHeight={22}
                  maxWidth={500}
                >
                  &ldquo;Utrolig enkelt! Tok bilde av alt rotet i garasjen, fikk
                  pris med en gang, og de hentet alt neste dag.&rdquo;
                </Text>
                <Text fontSize={13} fontWeight="600" color="$textSecondary">
                  — Maria K., Oslo
                </Text>
              </YStack>
            </Card>

            {/* Miljøvennlig badge */}
            <XStack
              alignItems="center"
              justifyContent="center"
              gap="$md"
              padding="$lg"
            >
              <Ionicons name="earth-outline" size={20} color={colors.primary} />
              <Text fontSize={14} fontWeight="600" color="$primary">
                Miljøvennlig — vi kildesorterer og resirkulerer
              </Text>
            </XStack>
          </YStack>
        </Section>

        {/* Bottom CTA */}
        <Section>
          <Card elevated padding="$xl">
            <YStack gap="$lg" alignItems="center">
              <H3 color="$textPrimary" fontFamily="$heading" textAlign="center">
                Klar for å bli kvitt avfallet?
              </H3>
              <Text
                fontSize={15}
                color="$textSecondary"
                textAlign="center"
                maxWidth={400}
              >
                Det tar under 2 minutter å bestille. Ta bilde, få pris, ferdig!
              </Text>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                maxWidth={400}
                onPress={() => router.push("/order/upload")}
              >
                Kom i gang
              </Button>
            </YStack>
          </Card>
        </Section>

        {/* Footer */}
        <YStack
          padding="$xl"
          paddingTop="$2xl"
          borderTopWidth={1}
          borderTopColor="$border"
          maxWidth={800}
          alignSelf="center"
          width="100%"
        >
          <Text fontSize={12} color="$textMuted" textAlign="center">
            © 2026 Avfall Henting AS · Vilkår · Personvern
          </Text>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
