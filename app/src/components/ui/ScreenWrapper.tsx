import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, ViewStyle, Text } from "react-native";
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

export const PageHeader: React.FC<{ title: string; style?: object }> = ({ title, style }) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.pageHeader, { color: colors.text }, style]}>
      {title}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  pageHeader: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
});
