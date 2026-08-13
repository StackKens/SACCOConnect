import { useState } from "react";
import { View, Text, Modal, ScrollView, TouchableOpacity } from "react-native";
import { Check, Globe, Languages } from "lucide-react-native";
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

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  en: "English",
  sw: "Swahili",
};

/**
 * Country and language picker used by the member and admin settings screens.
 * Country and language are independent — changing one never changes the other.
 */
export function CountryLanguageSettings() {
  const { colors, spacing, radius, typography } = useTheme();
  const { country, countryCode, setCountry } = useCountry();
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [picker, setPicker] = useState<"country" | "language" | null>(null);

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
        accessibilityLabel="Select country"
        style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg }}
      >
        <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt as string, alignItems: "center", justifyContent: "center" }}>
          <Globe size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Country</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>
            {country.flagEmoji} {country.name} · {country.currency}
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.textMuted }]}>{country.phoneCode}</Text>
      </TouchableOpacity>

      <View style={{ height: 1, backgroundColor: colors.border }} />

      <TouchableOpacity
        onPress={() => setPicker("language")}
        accessibilityRole="button"
        accessibilityLabel="Select language"
        style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.lg }}
      >
        <View style={{ width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt as string, alignItems: "center", justifyContent: "center" }}>
          <Languages size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.bodyMedium, { color: colors.text }]}>Language</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 1 }]}>
            {LANGUAGE_LABELS[language]}
          </Text>
        </View>
      </TouchableOpacity>

      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: spacing.xl, maxHeight: "70%" }}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>
              {picker === "country" ? "Select Country" : "Select Language"}
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
                        {selected && <Check size={20} color={colors.primary} />}
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
                        accessibilityLabel={LANGUAGE_LABELS[lang]}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: spacing.md,
                          paddingVertical: spacing.md,
                          borderBottomWidth: 1,
                          borderBottomColor: colors.border,
                        }}
                      >
                        <Text style={[typography.bodyMedium, { color: colors.text, flex: 1 }]}>{LANGUAGE_LABELS[lang]}</Text>
                        {selected && <Check size={20} color={colors.primary} />}
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
