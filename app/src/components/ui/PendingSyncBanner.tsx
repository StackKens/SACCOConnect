import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CloudOff, RefreshCw } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";
import { useQueueLength } from "../../hooks/useQueueLength";
import { flushQueue } from "../../services/offlineQueue";
import { useAuthStore } from "../../store/auth.store";

export const PendingSyncBanner: React.FC = () => {
  const { colors } = useTheme();
  const pending = useQueueLength();
  const user = useAuthStore((state) => state.user);
  const [syncing, setSyncing] = useState(false);

  if (pending === 0 || !user) return null;

  const handleSync = async () => {
    setSyncing(true);
    try {
      await flushQueue();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: colors.warning + "1A", borderColor: colors.warning + "55" },
      ]}
      accessibilityRole="alert"
    >
      <CloudOff size={16} color={colors.warning} />
      <Text style={[styles.text, { color: colors.text }]} numberOfLines={2}>
        {pending} offline {pending === 1 ? "action" : "actions"} waiting to sync
      </Text>
      <TouchableOpacity
        onPress={handleSync}
        disabled={syncing}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Sync now"
        accessibilityState={{ busy: syncing }}
        style={styles.syncBtn}
      >
        {syncing ? (
          <RefreshCw size={16} color={colors.warning} />
        ) : (
          <Text style={[styles.syncText, { color: colors.warning }]}>Sync now</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  text: { flex: 1, fontSize: 13, fontWeight: "500" },
  syncBtn: { paddingVertical: 2, paddingLeft: 4 },
  syncText: { fontSize: 13, fontWeight: "700" },
});
