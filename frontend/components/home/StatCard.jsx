import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";
import Card from "../ui/Card";

export default function StatCard({ value, label, backgroundColor }) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      cardContent: {
         alignItems: "center",
      },
      statValue: {
         fontSize: 24,
         fontWeight: "bold",
         color: theme.textPrimary,
         marginBottom: 4,
      },
      statLabel: {
         fontSize: 12,
         color: theme.textSecondary,
         opacity: 0.9,
      },
   });

   return (
      <Card
         style={{
            flex: 1,
            backgroundColor: backgroundColor || theme.secondary,
         }}
      >
         <View style={styles.cardContent}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
         </View>
      </Card>
   );
}
