import { TextInput, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";
import { Font, FontSize, Radius } from "../../constants/colors";

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
         backgroundColor: theme.surface,
         borderWidth: 1,
         borderColor: theme.border,
         borderRadius: Radius.input,
         paddingHorizontal: 16,
         paddingVertical: 12,
         fontFamily: Font.regular,
         fontSize: FontSize.body,
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
