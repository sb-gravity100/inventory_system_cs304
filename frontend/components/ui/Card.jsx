import { View } from "react-native";
import { useTheme } from "../ThemeProvider";
import { Spacing, Radius } from "../../constants/colors";

export default function Card({ children, style }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: Radius.card,
          borderWidth: 1,
          borderColor: theme.border,
          padding: Spacing.cardPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
