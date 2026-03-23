import { forwardRef, useState } from "react";
import { TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { useTheme } from "./ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

const PasswordInput = forwardRef(function PasswordInput(
  { value, onChangeText, placeholder = "Enter password", style, ...props },
  ref,
) {
  const [secure, setSecure] = useState(true);
  const { theme } = useTheme();

  const s = StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.input,
    },
    input: {
      flex: 1,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textPrimary,
    },
    toggle: {
      padding: Spacing.md,
    },
  });

  return (
    <View style={[s.container, style]}>
      <TextInput
        ref={ref}
        style={s.input}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
      />
      <TouchableOpacity style={s.toggle} onPress={() => setSecure(!secure)}>
        <MaterialIcons
          name={secure ? "visibility-off" : "visibility"}
          size={20}
          color={theme.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
});

export default PasswordInput;
