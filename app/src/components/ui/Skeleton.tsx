import React, { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../../hooks/useTheme";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, radius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 750, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  const base = colors.skeleton;

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: base, opacity },
        style,
      ]}
    />
  );
}

// --- Composable skeleton layouts ---

export function SkeletonMemberCard() {
  return (
    <View style={sk.card}>
      <Skeleton width={48} height={48} radius={24} />
      <View style={sk.cardBody}>
        <Skeleton width="60%" height={14} style={sk.mb6} />
        <Skeleton width="40%" height={12} style={sk.mb6} />
        <Skeleton width="30%" height={11} />
      </View>
      <Skeleton width={16} height={16} radius={4} />
    </View>
  );
}

export function SkeletonMemberList() {
  return (
    <View>
      <Skeleton height={40} radius={10} style={sk.mb14} />
      {[0, 1, 2, 3, 4].map((i) => (
        <View key={i} style={[sk.cardWrap, sk.mb12]}>
          <SkeletonMemberCard />
        </View>
      ))}
    </View>
  );
}

export function SkeletonMemberDetail() {
  return (
    <View>
      <View style={[sk.cardWrap, sk.mb16, { flexDirection: "row", alignItems: "center", gap: 16 }]}>
        <Skeleton width={72} height={72} radius={36} />
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width="70%" height={14} />
          <Skeleton width="50%" height={12} />
          <Skeleton width="55%" height={12} />
        </View>
      </View>
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width="40%" height={13} style={sk.mb14} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <Skeleton height={80} radius={10} style={{ flex: 1 }} />
          <Skeleton height={80} radius={10} style={{ flex: 1 }} />
        </View>
      </View>
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width="50%" height={13} style={sk.mb14} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={[{ flexDirection: "row", justifyContent: "space-between" }, sk.mb12]}>
            <Skeleton width="35%" height={12} />
            <Skeleton width="25%" height={12} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonStatGrid() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 16 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[sk.cardWrap, { width: "48%", marginBottom: 12 }]}>
          <Skeleton width={28} height={28} radius={14} style={sk.mb8} />
          <Skeleton width="60%" height={11} style={sk.mb6} />
          <Skeleton width="80%" height={18} />
        </View>
      ))}
    </View>
  );
}

export function SkeletonLoanCard() {
  return (
    <View style={[sk.cardWrap, sk.mb12]}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
        <Skeleton width="45%" height={14} />
        <Skeleton width={60} height={22} radius={11} />
      </View>
      <Skeleton width="70%" height={20} style={sk.mb8} />
      <Skeleton width="55%" height={12} style={sk.mb6} />
      <Skeleton width="40%" height={11} />
    </View>
  );
}

export function SkeletonLoanQueue() {
  return (
    <View>
      <Skeleton height={40} radius={10} style={sk.mb14} />
      {[0, 1, 2, 3].map((i) => <SkeletonLoanCard key={i} />)}
    </View>
  );
}

export function SkeletonTreasury() {
  return (
    <View>
      <SkeletonStatGrid />
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width="40%" height={13} style={sk.mb14} />
        <Skeleton height={140} radius={8} />
      </View>
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width="45%" height={13} style={sk.mb14} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={[{ flexDirection: "row", alignItems: "center", gap: 12 }, sk.mb12]}>
            <Skeleton width={32} height={32} radius={8} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="55%" height={13} />
              <Skeleton width="40%" height={11} />
            </View>
            <Skeleton width="20%" height={13} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function SkeletonDashboard() {
  return (
    <View>
      <SkeletonStatGrid />
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width="35%" height={14} style={sk.mb14} />
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={44} radius={10} style={sk.mb10} />
        ))}
      </View>
    </View>
  );
}

export function SkeletonHome() {
  return (
    <View>
      <Skeleton width="40%" height={16} style={sk.mb8} />
      <Skeleton width="55%" height={12} style={sk.mb20} />
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width={80} height={11} style={sk.mb10} />
        <Skeleton width="70%" height={36} style={sk.mb10} />
        <Skeleton width="40%" height={12} />
      </View>
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width={80} height={11} style={sk.mb10} />
        <Skeleton width="50%" height={28} style={sk.mb8} />
        <Skeleton width="35%" height={12} />
      </View>
      <View style={[sk.cardWrap, sk.mb16]}>
        <Skeleton width="45%" height={13} style={sk.mb14} />
        <Skeleton width="55%" height={24} style={sk.mb8} />
        <Skeleton width="35%" height={12} style={sk.mb14} />
        <Skeleton height={48} radius={12} />
      </View>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <Skeleton height={56} radius={12} style={{ flex: 1 }} />
        <Skeleton height={56} radius={12} style={{ flex: 1 }} />
      </View>
      <Skeleton height={56} radius={12} style={[sk.mt12, { alignSelf: "stretch" }]} />
    </View>
  );
}

const sk = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardWrap: { backgroundColor: "transparent", borderRadius: 12, padding: 16, borderWidth: 1, borderColor: "transparent" },
  cardBody: { flex: 1, gap: 4 },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb10: { marginBottom: 10 },
  mb12: { marginBottom: 12 },
  mb14: { marginBottom: 14 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  mt12: { marginTop: 12 },
});
