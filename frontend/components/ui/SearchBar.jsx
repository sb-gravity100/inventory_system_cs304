import { TextInput, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";

export default function SearchBar({
   value,
   onChangeText,
   placeholder = "Search...",
   style,
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      searchBar: {
         backgroundColor: theme.bg2,
         borderRadius: 8,
         paddingHorizontal: 16,
         paddingVertical: 12,
         fontSize: 16,
         color: theme.textPrimary,
      },
   });

   return (
      <TextInput
         style={[styles.searchBar, style]}
         placeholder={placeholder}
         placeholderTextColor={theme.textSecondary}
         value={value}
         onChangeText={onChangeText}
      />
   );
}
