import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/Button";
import { Pagination } from "../components/Pagination";
import { OnboardingSlide } from "../components/OnboardingSlide";
import { onboardingData } from "../data/onboardingData";
import { useTranslation } from "react-i18next";
import { CountryLanguageSettings } from "@/components/preferences/CountryLanguageSettings";

const ENTRY_ROUTE = "/(auth)/entry";

export function OnboardingScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation("auth");
  const { width } = useWindowDimensions();
  const router = useRouter();

  const [activeIndex, setActiveIndex] = useState(0);
  const [listHeight, setListHeight] = useState(0);
  const listRef = useRef<FlatList<typeof onboardingData[number]>>(null);

  const slides = onboardingData.map((slide, index) => ({ ...slide, title: t(`onboarding.slide${index + 1}Title`), description: t(`onboarding.slide${index + 1}Description`) }));
  const isLastSlide = activeIndex === slides.length - 1;

  const finish = useCallback(() => {
    router.replace(ENTRY_ROUTE);
  }, [router]);

  const goNext = useCallback(() => {
    if (isLastSlide) {
      finish();
      return;
    }
    const next = activeIndex + 1;
    setActiveIndex(next);
    listRef.current?.scrollToIndex({
      index: next,
      animated: true,
    });
  }, [activeIndex, isLastSlide, finish]);

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      setActiveIndex(Math.min(Math.max(next, 0), slides.length - 1));
    },
    [width, slides.length],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setListHeight(e.nativeEvent.layout.height);
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<typeof onboardingData[number]>) => (
      <View style={{ width, height: listHeight }}>
        <OnboardingSlide slide={item} />
      </View>
    ),
    [width, listHeight],
  );

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.brand, { color: colors.primary }]}>
            SACCOConnect
          </Text>
          {!isLastSlide && (
            <Pressable
              onPress={finish}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={[styles.skip, { color: colors.textSecondary }]}>
                Skip
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.pickerArea}>
          <CountryLanguageSettings />
        </View>

        <View style={styles.pagerArea} onLayout={onLayout}>
          {listHeight > 0 && (
            <FlatList
              ref={listRef}
              data={slides}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
              initialNumToRender={2}
              windowSize={3}
            />
          )}
        </View>

        <View style={styles.footer}>
          <Pagination
            count={slides.length}
            activeIndex={activeIndex}
          />

          <Button
            title={isLastSlide ? t("onboarding.getStarted") : t("common:next")}
            onPress={goNext}
            style={styles.button}
            accessibilityLabel={
              isLastSlide ? "Get Started" : "Next onboarding page"
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 24,
  },
  brand: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  skip: {
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  pagerArea: {
    flex: 1,
  },
  pickerArea: {
    paddingHorizontal: 24,
  },
  footer: {
    marginTop: 20,
    gap: 18,
    paddingHorizontal: 24,
  },
  button: {
    height: 54,
  },
});
