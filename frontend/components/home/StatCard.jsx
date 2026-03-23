import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

/**
 * colorScheme: "blue" | "green" | "neutral"
 * fullWidth: boolean — spans full row
 */
export default function StatCard({ value, label, colorScheme = "neutral", fullWidth = false }) {
  const { theme } = useTheme();

  const schemeMap = {
    blue: theme.statBlue,
    green: theme.statGreen,
    neutral: theme.statNeutral,
  };

  const scheme = schemeMap[colorScheme] || theme.statNeutral;

  const styles = StyleSheet.create({
    card: {
      backgroundColor: scheme.bg,
      borderRadius: Radius.card,
      padding: Spacing.cardPadding,
      flex: fullWidth ? undefined : 1,
      width: fullWidth ? "100%" : undefined,
    },
    value: {
      fontFamily: Font.bold,
      fontSize: FontSize.statValue,
      color: scheme.text,
      marginBottom: 2,
    },
    label: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: scheme.text,
      opacity: 0.8,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
