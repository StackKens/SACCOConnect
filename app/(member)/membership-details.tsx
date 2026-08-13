import { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/services/api";
import { formatDate } from "@/utils/date";
import { formatCurrency } from "@/utils/currency";
import { BadgeCheck, Users, Wallet } from "lucide-react-native";

interface MemberProfile {
  id: string;
  fullName: string;
  nationalId?: string | null;
  status: string;
  currentBalance: number;
  joinDate?: string;
  createdAt?: string;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PENDING":
      return "Pending";
    case "SUSPENDED":
      return "Suspended";
    default:
      return status;
  }
}

export default function MembershipDetails() {
  const { colors } = useTheme();
  const user = useAuthStore((state) => state.user);
  const sacco = useAuthStore((state) => state.sacco);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/members/me")
      .then((res) => {
        const data = res.data?.data;
        if (data) {
          setMember({
            id: data.id,
            fullName: data.fullName,
            nationalId: data.nationalId ?? user?.nationalId ?? null,
            status: data.status ?? "ACTIVE",
            currentBalance: data.currentBalance ?? 0,
            joinDate: data.joinDate ?? data.createdAt,
          });
        }
      })
      .catch(() => {
        setMember(null);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <ScreenWrapper header={<PageHeader title="Membership Details" showBack />}>
        <LoadingSpinner />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      header={<PageHeader title="Membership Details" subtitle="Your membership information" showBack />}
    >
      <Card style={styles.card}>
        <View style={styles.headerRow}>
          <BadgeCheck size={24} color={colors.primary} />
          <View style={styles.headerText}>
            <Text style={[styles.name, { color: colors.text }]}>
              {member?.fullName ?? user?.name ?? "Member"}
            </Text>
            <Text style={[styles.badge, { color: colors.secondary }]}>
              {statusLabel(member?.status ?? "ACTIVE")} MEMBER
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <DetailRow label="Membership ID" value={member?.id ?? "—"} />
        <DetailRow label="Joined" value={member?.joinDate ? formatDate(member.joinDate) : "—"} />
        <DetailRow label="National ID" value={member?.nationalId || "Not provided"} />
        <DetailRow label="Phone Number" value={user?.phone ?? "—"} />

        <View style={styles.divider} />

        <View style={styles.statRow}>
          <View style={[styles.stat, { backgroundColor: colors.primary + "12" }]}>
            <Wallet size={18} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {formatCurrency(member?.currentBalance ?? 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Balance</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.secondary + "14" }]}>
            <Users size={18} color={colors.secondary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{sacco?.name ?? "—"}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>SACCO</Text>
          </View>
        </View>
      </Card>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 4 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerText: { flex: 1 },
  name: { fontSize: 18, fontWeight: "800" },
  badge: { fontSize: 12, fontWeight: "600", marginTop: 2 },
  divider: { height: 1, backgroundColor: "rgba(128,128,128,0.2)", marginVertical: 16 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, gap: 12 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: "600", flexShrink: 1, textAlign: "right" },
  statRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, borderRadius: 12, padding: 14, gap: 4 },
  statValue: { fontSize: 15, fontWeight: "800", marginTop: 6 },
  statLabel: { fontSize: 12 },
});
