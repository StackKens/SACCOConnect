import { useState } from "react";
import { Text, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { ScreenWrapper, PageHeader } from "@/components/ui/ScreenWrapper";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "react-i18next";
import { saccoApi, getApiErrorMessage } from "@/services/auth.service";
import type { PaymentAccount } from "@/types";
import {
  PaymentAccountForm,
  PaymentAccountDraft,
} from "@/features/sacco/PaymentAccountForm";
import { PaymentAccountListItem } from "@/features/sacco/PaymentAccountListItem";
import { Landmark } from "lucide-react-native";

const emptyDraft: PaymentAccountDraft = {
  type: "MOBILE_MONEY",
  accountNumber: "",
  accountName: "",
  provider: "",
};

export default function PaymentConfig() {
  const { t } = useTranslation("admin");
  const { colors } = useTheme();
  const sacco = useAuthStore((s) => s.sacco);
  const setPaymentAccounts = useAuthStore((s) => s.setPaymentAccounts);

  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PaymentAccountDraft>(emptyDraft);

  const accounts = sacco?.paymentAccounts ?? [];

  const handleAdd = async () => {
    if (!draft.accountName.trim()) {
      return Alert.alert(t("payment.required"), t("payment.requiredName"));
    }
    setSaving(true);
    try {
      const res = await saccoApi.addPaymentAccount({
        type: draft.type,
        accountNumber: draft.accountNumber.trim(),
        accountName: draft.accountName.trim(),
        provider: draft.provider.trim() || undefined,
      });
      setPaymentAccounts([...accounts, res.data.data]);
      setAdding(false);
      setDraft(emptyDraft);
    } catch (e) {
      Alert.alert(t("payment.addFailed"), getApiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (
    account: PaymentAccount,
    patch: { isActive?: boolean; isMemberVisible?: boolean },
  ) => {
    setUpdatingId(account.id);
    try {
      const res = await saccoApi.updatePaymentAccount(account.id, patch);
      setPaymentAccounts(
        accounts.map((a) => (a.id === account.id ? res.data.data : a)),
      );
    } catch (e) {
      Alert.alert(t("payment.updateFailed"), getApiErrorMessage(e));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <ScreenWrapper
      header={
        <PageHeader
          title={t("payment.title")}
          subtitle={t("payment.subtitle")}
          showBack
          onBack={() => router.back()}
        />
      }
    >
      <Text style={[styles.note, { color: colors.textSecondary }]}>
        {t("payment.note")}
      </Text>

      {accounts.length === 0 && !adding ? (
        <EmptyState
          icon={<Landmark size={32} color={colors.secondary} />}
          title={t("payment.emptyTitle")}
          description={t("payment.emptyMsg")}
        />
      ) : (
        accounts.map((account) => (
          <PaymentAccountListItem
            key={account.id}
            account={account}
            updating={updatingId === account.id}
            onToggleActive={(v) => handleToggle(account, { isActive: v })}
            onToggleVisible={(v) => handleToggle(account, { isMemberVisible: v })}
            activeLabel={t("payment.active")}
            visibleLabel={t("payment.visible")}
            providerLabel={t("payment.provider")}
          />
        ))
      )}

      {adding ? (
        <Card style={styles.addCard}>
          <PaymentAccountForm
            value={draft}
            onChange={setDraft}
            accountNameLabel={t("payment.accountName")}
          />
          <Button title={t("payment.save")} onPress={handleAdd} loading={saving} style={{ marginTop: 8 }} />
        </Card>
      ) : (
        <Button
          title={t("payment.add")}
          onPress={() => setAdding(true)}
          variant="outline"
          style={{ marginTop: 8 }}
        />
      )}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  note: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  addCard: { marginTop: 8 },
});
