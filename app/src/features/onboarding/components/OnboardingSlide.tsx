import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { OnboardingIllustration } from "./OnboardingIllustration";
import type { OnboardingSlide as OnboardingSlideData } from "../types";

interface OnboardingSlideProps {
  slide: OnboardingSlideData;
}

/**
 * Renders one onboarding page: illustration, headline and supporting text.
 * Content comes from the data layer so copy can change without touching UI.
 */
export function OnboardingSlide({ slide }: OnboardingSlideProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.slide}>
      <View style={styles.illustrationArea}>
        <OnboardingIllustration variant={slide.variant} />
      </View>

      <Text
        style={[typography.display, styles.title, { color: colors.text }]}
        accessibilityRole="header"
      >
        {slide.title}
      </Text>

      <Text
        style={[
          typography.body,
          styles.description,
          { color: colors.textSecondary },
        ]}
      >
        {slide.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    paddingHorizontal: 4,
  },
  illustrationArea: {
    flex: 1,
    minHeight: 200,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  description: {
    textAlign: "center",
    maxWidth: 360,
    alignSelf: "center",
    paddingHorizontal: 8,
  },
});
