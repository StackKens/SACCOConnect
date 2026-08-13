import { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import type { OnboardingVariant } from "../types";

const DESIGN_WIDTH = 300;
const SCENE_HEIGHTS: Record<OnboardingVariant, number> = {
  saveBorrowGrow: 280,
  yourSacco: 304,
};

interface SceneWrapperProps {
  children: React.ReactNode;
  designHeight: number;
}

/**
 * Scales a fixed-design-size illustration down (never up) to fit the space
 * available, so it renders correctly on small and large phones without
 * hardcoded screen coordinates.
 */
function SceneWrapper({ children, designHeight }: SceneWrapperProps) {
  const [area, setArea] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== area.width || height !== area.height) {
      setArea({ width, height });
    }
  };

  const scale = Math.min(
    1,
    area.width ? area.width / DESIGN_WIDTH : 1,
    area.height ? area.height / designHeight : 1,
  );

  return (
    <View style={styles.sceneArea} onLayout={onLayout}>
      <View
        style={[
          styles.scene,
          {
            width: DESIGN_WIDTH,
            height: designHeight,
            transform: [{ scale }],
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

function SaveBorrowGrowIllustration() {
  const { colors } = useTheme();
  const white = (alpha: number) => `rgba(255,255,255,${alpha})`;

  return (
    <View style={styles.centeredScene}>
      <View style={[styles.halo, { backgroundColor: colors.successSoft }]} />

      <View style={[styles.growthCard, { backgroundColor: colors.primary }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.cardHeaderDot, { backgroundColor: white(0.25) }]} />
          <View style={[styles.cardHeaderLine, { backgroundColor: white(0.6) }]} />
          <View style={[styles.cardHeaderLine, { backgroundColor: white(0.6) }]} />
          <View style={[styles.cardHeaderLine, { backgroundColor: white(0.6) }]} />
        </View>

        <View style={[styles.cardBalance, { backgroundColor: white(0.92) }]} />

        <View style={styles.cardProgressRow}>
          <View style={[styles.cardProgressTrack, { backgroundColor: white(0.22) }]}>
            <View
              style={[styles.cardProgressFill, { backgroundColor: colors.secondary }]}
            />
          </View>
          <View style={styles.cardChip}>
            <View
              style={[styles.cardChipDot, { backgroundColor: colors.secondary }]}
            />
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={[styles.cardFooterCard, { backgroundColor: white(0.16) }]} />
          <View style={[styles.cardFooterCard, { backgroundColor: white(0.16) }]} />
        </View>
      </View>

      <View style={[styles.growthBars, { justifyContent: "flex-end" }]}>
        {[0.42, 0.6, 0.78, 1].map((h, i) => (
          <View
            key={i}
            style={[
              styles.growthBar,
              {
                height: `${h * 100}%`,
                backgroundColor: i === 3 ? colors.secondary : colors.info,
              },
            ]}
          />
        ))}
      </View>

      <View style={[styles.coinBack, { borderColor: colors.secondary }]}>
        <View style={[styles.coinRing, { borderColor: colors.secondary }]} />
      </View>
      <View style={[styles.coinFront, { backgroundColor: colors.secondary }]}>
        <View style={styles.coinFrontRing} />
      </View>
    </View>
  );
}

function YourSaccoIllustration() {
  const { colors } = useTheme();

  return (
    <View style={styles.centeredScene}>
      <View style={[styles.phone, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
        <View style={[styles.phoneNotch, { backgroundColor: colors.primary }]} />

        <View style={styles.phoneBody}>
          <View style={styles.phoneTopRow}>
            <View style={[styles.phoneBrandDot, { backgroundColor: colors.secondary }]} />
            <View style={[styles.phoneBrandText, { backgroundColor: colors.primary }]} />
            <View style={[styles.phoneBell, { backgroundColor: colors.border }]} />
          </View>

          <View style={[styles.phoneBalanceCard, { backgroundColor: colors.primary }]}>
            <View style={[styles.phoneCardLabel, { backgroundColor: "rgba(255,255,255,0.55)" }]} />
            <View style={[styles.phoneCardAmount, { backgroundColor: "rgba(255,255,255,0.92)" }]} />
            <View style={[styles.phoneCardProgressTrack, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
              <View
                style={[styles.phoneCardProgressFill, { backgroundColor: colors.secondary }]}
              />
            </View>
          </View>

          <View style={styles.phoneStatRow}>
            <View style={[styles.phoneStat, { borderColor: colors.border }]}>
              <View style={[styles.phoneStatLabel, { backgroundColor: colors.skeleton }]} />
              <View style={[styles.phoneStatValue, { backgroundColor: colors.textMuted }]} />
            </View>
            <View style={[styles.phoneStat, { borderColor: colors.border }]}>
              <View style={[styles.phoneStatLabel, { backgroundColor: colors.skeleton }]} />
              <View style={[styles.phoneStatValue, { backgroundColor: colors.textMuted }]} />
            </View>
          </View>

          <View style={[styles.phoneDivider, { backgroundColor: colors.border }]} />

          <View style={[styles.phoneSectionLabel, { backgroundColor: colors.textMuted }]} />

          <View style={styles.phoneActivityRow}>
            <View style={[styles.phoneActivityIcon, { backgroundColor: colors.successSoft }]}>
              <View style={[styles.phoneActivityPlus, { backgroundColor: colors.secondary }]} />
            </View>
            <View style={styles.phoneActivityLines}>
              <View style={[styles.phoneActivityLine, { backgroundColor: colors.skeleton }]} />
              <View style={[styles.phoneActivityLineShort, { backgroundColor: colors.border }]} />
            </View>
          </View>

          <View style={styles.phoneActivityRow}>
            <View style={[styles.phoneActivityIcon, { backgroundColor: colors.infoSoft }]}>
              <View style={[styles.phoneActivityMinus, { backgroundColor: colors.info }]} />
            </View>
            <View style={styles.phoneActivityLines}>
              <View style={[styles.phoneActivityLine, { backgroundColor: colors.skeleton }]} />
              <View style={[styles.phoneActivityLineShort, { backgroundColor: colors.border }]} />
            </View>
          </View>

          <View style={[styles.phoneCta, { backgroundColor: colors.secondary }]} />
        </View>
      </View>

      <View
        style={[
          styles.floatingChipTop,
          { backgroundColor: colors.successSoft, borderColor: colors.border },
        ]}
      >
        <View style={[styles.floatingChipDot, { backgroundColor: colors.secondary }]} />
      </View>
      <View
        style={[
          styles.floatingChipBottom,
          { backgroundColor: colors.infoSoft, borderColor: colors.border },
        ]}
      >
        <View style={[styles.floatingChipLine, { backgroundColor: colors.info }]} />
        <View style={[styles.floatingChipLineShort, { backgroundColor: colors.info }]} />
      </View>
    </View>
  );
}

export function OnboardingIllustration({ variant }: { variant: OnboardingVariant }) {
  return (
    <SceneWrapper designHeight={SCENE_HEIGHTS[variant]}>
      {variant === "saveBorrowGrow" ? (
        <SaveBorrowGrowIllustration />
      ) : (
        <YourSaccoIllustration />
      )}
    </SceneWrapper>
  );
}

const styles = StyleSheet.create({
  sceneArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  scene: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centeredScene: {
    width: DESIGN_WIDTH,
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  halo: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.55,
  },
  growthCard: {
    width: 232,
    borderRadius: 22,
    padding: 20,
    elevation: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 18,
  },
  cardHeaderDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 2,
  },
  cardHeaderLine: {
    width: 12,
    height: 5,
    borderRadius: 3,
    opacity: 0.9,
  },
  cardBalance: {
    width: 140,
    height: 16,
    borderRadius: 6,
    marginBottom: 20,
  },
  cardProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  },
  cardProgressTrack: {
    flex: 1,
    height: 9,
    borderRadius: 10,
    overflow: "hidden",
  },
  cardProgressFill: {
    width: "78%",
    height: "100%",
    borderRadius: 10,
  },
  cardChip: {
    width: 26,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 10,
  },
  cardFooterCard: {
    flex: 1,
    height: 34,
    borderRadius: 10,
  },
  growthBars: {
    position: "absolute",
    right: 18,
    bottom: 14,
    width: 74,
    height: 96,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 6,
  },
  growthBar: {
    width: 13,
    borderRadius: 6,
  },
  coinBack: {
    position: "absolute",
    left: 22,
    top: 30,
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 5,
    opacity: 0.55,
  },
  coinRing: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    opacity: 0.7,
    marginTop: 14,
    marginLeft: 14,
  },
  coinFront: {
    position: "absolute",
    left: 52,
    top: 74,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  coinFrontRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.65)",
  },

  phone: {
    width: 178,
    height: 304,
    borderRadius: 30,
    borderWidth: 6,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  phoneNotch: {
    width: 62,
    height: 7,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 8,
  },
  phoneBody: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  phoneTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  phoneBrandDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
  phoneBrandText: {
    width: 46,
    height: 6,
    borderRadius: 3,
  },
  phoneBell: {
    width: 16,
    height: 10,
    borderRadius: 5,
    marginLeft: "auto",
  },
  phoneBalanceCard: {
    borderRadius: 14,
    padding: 12,
    marginVertical: 10,
  },
  phoneCardLabel: {
    width: 44,
    height: 5,
    borderRadius: 3,
    marginBottom: 7,
  },
  phoneCardAmount: {
    width: 88,
    height: 11,
    borderRadius: 5,
    marginBottom: 9,
  },
  phoneCardProgressTrack: {
    height: 6,
    borderRadius: 10,
    overflow: "hidden",
  },
  phoneCardProgressFill: {
    width: "72%",
    height: "100%",
    borderRadius: 10,
  },
  phoneStatRow: {
    flexDirection: "row",
    gap: 8,
  },
  phoneStat: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    padding: 8,
    gap: 5,
  },
  phoneStatLabel: {
    width: "80%",
    height: 5,
    borderRadius: 3,
  },
  phoneStatValue: {
    width: "65%",
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },
  phoneDivider: {
    height: 1,
    marginVertical: 8,
  },
  phoneSectionLabel: {
    width: 78,
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  phoneActivityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phoneActivityIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  phoneActivityPlus: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  phoneActivityMinus: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  phoneActivityLines: {
    flex: 1,
    gap: 4,
  },
  phoneActivityLine: {
    width: "88%",
    height: 6,
    borderRadius: 3,
  },
  phoneActivityLineShort: {
    width: "52%",
    height: 5,
    borderRadius: 3,
  },
  phoneCta: {
    height: 18,
    borderRadius: 9,
  },

  floatingChipTop: {
    position: "absolute",
    top: 26,
    right: 26,
    width: 42,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  floatingChipDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  floatingChipBottom: {
    position: "absolute",
    bottom: 34,
    left: 20,
    width: 56,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
  },
  floatingChipLine: {
    width: 30,
    height: 4,
    borderRadius: 2,
  },
  floatingChipLineShort: {
    width: 18,
    height: 4,
    borderRadius: 2,
  },
});
