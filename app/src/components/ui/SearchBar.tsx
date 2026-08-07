import React, { useState } from "react";
import { TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import { Search, XCircle } from "lucide-react-native";
import { useTheme } from "../../hooks/useTheme";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceDelay?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  debounceDelay = 300,
}) => {
  const [query, setQuery] = useState("");
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { colors } = useTheme();

  const handleChange = (text: string) => {
    setQuery(text);
    if (timeoutId) clearTimeout(timeoutId);
    const id = setTimeout(() => onSearch(text), debounceDelay);
    setTimeoutId(id);
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    if (timeoutId) clearTimeout(timeoutId);
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <Search size={20} color={colors.textSecondary} />
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={query}
        onChangeText={handleChange}
        accessibilityLabel={placeholder}
      />
      {query.length > 0 && (
        <TouchableOpacity onPress={handleClear} accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8}>
          <XCircle size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 16 },
});
