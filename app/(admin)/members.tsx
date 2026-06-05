import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";

const mockMembers = [
  {
    id: "1",
    name: "Alice Wanjiku",
    email: "alice@example.com",
    savings: 25000,
    loans: 12000,
    status: "active",
  },
  {
    id: "2",
    name: "Bob Omondi",
    email: "bob@example.com",
    savings: 18000,
    loans: 0,
    status: "active",
  },
  {
    id: "3",
    name: "Catherine Muthoni",
    email: "catherine@example.com",
    savings: 32000,
    loans: 5000,
    status: "inactive",
  },
];

export default function Members() {
  const { colors } = useTheme();

  const renderMember = ({ item }: { item: typeof mockMembers[0] }) => (
    <TouchableOpacity
      onPress={() => router.push(`/(admin)/member-detail?id=${item.id}`)}
    >
      <Card style={styles.card}>
        <View style={styles.row}>
          <Avatar name={item.name} size={50} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.email, { color: colors.textSecondary }]}>
              {item.email}
            </Text>
            <Text style={[styles.savings, { color: colors.success }]}>
              {item.savings} KES saved
            </Text>
          </View>
          <ChevronRight size={20} color={colors.textSecondary} />
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <PageHeader title="Members" style={{ marginBottom: 0 }} />
        <Button
          title="Add Member"
          onPress={() => {}}
          variant="secondary"
        />
      </View>
      <FlatList
        data={mockMembers}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  list: { paddingBottom: 20 },
  card: { marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  email: { fontSize: 14, marginTop: 2 },
  savings: { fontSize: 12, marginTop: 4 },
});
