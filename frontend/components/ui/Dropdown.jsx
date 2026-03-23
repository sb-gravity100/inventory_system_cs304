import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

export default function Dropdown({ options = [], value, onChange }) {
  const { theme } = useTheme();

  const s = StyleSheet.create({
    container: {
      flexDirection: "row",
      gap: Spacing.sm,
    },
    option: {
      flex: 1,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.button,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    optionActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    optionText: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      textTransform: "capitalize",
    },
    optionTextActive: {
      fontFamily: Font.semiBold,
      color: "#ffffff",
    },
  });

  return (
    <View style={s.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[s.option, value === option && s.optionActive]}
          onPress={() => onChange(option)}
        >
          <Text style={[s.optionText, value === option && s.optionTextActive]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}