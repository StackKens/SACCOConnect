import { useState } from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity } from "react-native";
import { Check, Globe, Languages, ChevronRight } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";
import { useCountry } from "../../hooks/useCountry";
import { usePreferencesStore } from "../../store/preferences.store";
import {
  SUPPORTED_COUNTRY_CODES,
  getCountryConfig,
  type CountryCode,
} from "../../config";
import {
  SUPPORTED_LANGUAGES,
  type LanguageCode,
} from "../../localization/i18n";

/**
 * Country and language picker used by the member and admin settings screens.
 * Country and language are independent — changing one never changes the other.
 */
export function CountryLanguageSettings() {
  const { colors, spacing, radius, typography } = useTheme();
  const { t } = useTranslation("common");
  const { country, countryCode, setCountry } = useCountry();
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [picker, setPicker] = useState<"country" | "language" | null>(null);

  const languageLabel = (lang: LanguageCode) =>
    lang === "en" ? t("languageEnglish") : t("languageSwahili");

  const selectCountry = (code: CountryCode) => {
    setCountry(code);
    setPicker(null);
  };

  const selectLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    setPicker(null);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setPicker("country")}
        accessibilityRole="button"
        accessibilityLabel={t("selectCountry")}
        style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg }}
      >
        <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt as string, alignItems: "center", justifyContent: "center" }}>
          <Globe size={18} color={colors.primary} />
        </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{t("country")}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>
              {country.flagEmoji} {country.name} · {country.currency}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: colors.border }} />

      <TouchableOpacity
        onPress={() => setPicker("language")}
        accessibilityRole="button"
        accessibilityLabel={t("selectLanguage")}
        style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg }}
      >
        <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt as string, alignItems: "center", justifyContent: "center" }}>
          <Languages size={18} color={colors.primary} />
        </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>{t("language")}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>
              {languageLabel(language)}
            </Text>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl, maxHeight: "70%" }}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
              {picker === "country" ? t("selectCountry") : t("selectLanguage")}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {picker === "country"
                ? SUPPORTED_COUNTRY_CODES.map((code) => {
                    const c = getCountryConfig(code);
                    const selected = code === countryCode;
                    return (
                      <TouchableOpacity
                        key={code}
                        onPress={() => selectCountry(code)}
                        accessibilityRole="button"
                        accessibilityLabel={`${c.name}`}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing.md,
                          paddingVertical: spacing.md,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>{c.flagEmoji}</Text>
                         <View style={{ flex: 1 }}>
                           <Text style={[typography.bodyMedium, { color: colors.text }]}>{c.name}</Text>
                           <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>
                             {c.currency} · {c.phoneCode}
                           </Text>
                         </View>
                         {selected ? <Check size={20} color={colors.primary} /> : <ChevronRight size={18} color={colors.textMuted} />}
                      </TouchableOpacity>
                    );
                  })
                : SUPPORTED_LANGUAGES.map((lang) => {
                    const selected = lang === language;
                    return (
                      <TouchableOpacity
                        key={lang}
                        onPress={() => selectLanguage(lang)}
                        accessibilityRole="button"
                        accessibilityLabel={languageLabel(lang)}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing.md,
                          paddingVertical: spacing.md,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                         <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>{languageLabel(lang)}</Text>
                         {selected ? <Check size={20} color={colors.primary} /> : <ChevronRight size={18} color={colors.textMuted} />}
                      </TouchableOpacity>
                    );
                  })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
