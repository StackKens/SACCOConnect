import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  ViewStyle,
  View,
  Text,
} from "react-native";
import { useTheme } from "../../hooks/useTheme";
import { StatusBar } from "expo-status-bar";

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scroll = true,
  style,
}) => {
  const { colors, isDark } = useTheme();

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <>{children}</>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {content}
    </SafeAreaView>
  );
};

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  style?: object;
}> = ({ title, subtitle, style }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.pageHeaderWrapper, style]}>
      <Text style={[styles.pageHeader, { color: colors.text }]}>{title}</Text>
      <View
        style={[styles.pageHeaderAccent, { backgroundColor: colors.secondary }]}
      />
      {subtitle && (
        <Text
          style={[styles.pageHeaderSubtitle, { color: colors.textSecondary }]}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
  },
  pageHeaderWrapper: { marginBottom: 24, paddingTop: 8 },
  pageHeader: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  pageHeaderAccent: {
    width: 36,
    height: 3,
    borderRadius: 2,
    marginTop: 6,
    marginBottom: 4,
  },
  pageHeaderSubtitle: { fontSize: 13, marginTop: 2 },
});
