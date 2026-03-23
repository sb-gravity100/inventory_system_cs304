import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";

export default function ReportsScreen() {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      container: {
         flex: 1,
         backgroundColor: theme.background,
         justifyContent: "center",
         alignItems: "center",
         padding: 20,
      },
      title: {
         fontSize: 24,
         fontWeight: "bold",
         color: theme.textPrimary,
         marginBottom: 8,
      },
      subtitle: {
         fontSize: 16,
         color: theme.textSecondary,
         textAlign: "center",
      },
   });

   return (
      <SafeAreaView style={styles.container}>
         <Text style={styles.title}>📊 Reports</Text>
         <Text style={styles.subtitle}>
            Analytics and reporting features coming soon
         </Text>
      </SafeAreaView>
   );
}
