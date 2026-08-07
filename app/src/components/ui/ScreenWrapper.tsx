import React from "react";
import { ScrollView, StyleSheet, ViewStyle, View, Text, Pressable, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../hooks/useTheme";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { PendingSyncBanner } from "./PendingSyncBanner";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  header?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scroll = true,
  style,
  header,
  refreshing = false,
  onRefresh,
}) => {
  const { colors, isDark } = useTheme();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, style]}>{children}</View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {header}
      <PendingSyncBanner />
      {content}
    </SafeAreaView>
  );
};

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  style?: object;
  rightComponent?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}> = ({ title, subtitle, rightComponent, showBack = false, onBack, style }) => {
  const { colors } = useTheme();
  const handleBack = onBack ?? (() => router.back());
  return (
    <>
      <View style={[styles.pageHeaderWrapper, style]}>
        {showBack && (
          <Pressable
            onPress={handleBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.5 }]}
          >
            <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
          </Pressable>
        )}
        <View style={styles.pageHeaderTitleContainer}>
          <Text style={[styles.pageHeader, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.pageHeaderSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightComponent && (
          <View style={styles.pageHeaderRight}>{rightComponent}</View>
        )}
      </View>
      <View style={[styles.pageHeaderDivider, { backgroundColor: colors.border }]} />
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  staticContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  pageHeaderWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 8,
  },
  pageHeaderTitleContainer: { flex: 1 },
  pageHeader: { fontSize: 20, fontWeight: "700", letterSpacing: -0.3 },
  pageHeaderSubtitle: { fontSize: 12, marginTop: 2 },
  pageHeaderRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  pageHeaderDivider: { height: 1, opacity: 0.4, marginBottom: 16 },
  backBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
});
