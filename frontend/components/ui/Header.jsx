import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Font, FontSize, Spacing } from "../../constants/colors";

export default function Header({
  title,
  subtitle,
  showBack = false,
  rightActions = [],
}) {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    header: {
      paddingHorizontal: Spacing.screenPadding,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
      backgroundColor: theme.background,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    backButton: { padding: 4 },
    headerContent: { flex: 1 },
    headerTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
      marginBottom: subtitle ? 2 : 0,
    },
    headerSubtitle: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
    rightActions: { flexDirection: "row", gap: Spacing.sm },
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        {showBack && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="arrow-back"
              size={24}
              color={theme.textPrimary}
            />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.headerSubtitle}>{subtitle}</Text>
          )}
        </View>
        {rightActions.length > 0 && (
          <View style={styles.rightActions}>{rightActions}</View>
        )}
      </View>
    </View>
  );
}
