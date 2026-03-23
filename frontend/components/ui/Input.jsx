import { TextInput, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";

export default function Input({
   value,
   onChangeText,
   placeholder,
   keyboardType = "default",
   style,
   ...props
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      input: {
         backgroundColor: theme.bg2,
         borderWidth: 1,
         borderColor: theme.border,
         borderRadius: 8,
         paddingHorizontal: 16,
         paddingVertical: 12,
         fontSize: 16,
         color: theme.textPrimary,
      },
   });

   return (
      <TextInput
         style={[styles.input, style]}
         placeholder={placeholder}
         placeholderTextColor={theme.textSecondary}
         value={value}
         onChangeText={onChangeText}
         keyboardType={keyboardType}
         {...props}
      />
   );
}
