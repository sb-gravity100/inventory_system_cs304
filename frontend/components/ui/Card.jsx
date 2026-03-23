import { View, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";

export default function Card({ children, style, variant = "default" }) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      card: {
         backgroundColor: variant === "elevated" ? theme.bg2 : "#FFFFFF",
         borderRadius: 12,
         padding: 16,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1,
         shadowRadius: 4,
         elevation: 3,
      },
      cardDark: {
         backgroundColor: "#3A3A3A",
      },
   });

   return (
      <View style={[styles.card, theme.isDark && styles.cardDark, style]}>
         {children}
      </View>
   );
}
