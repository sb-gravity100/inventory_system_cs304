import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";
import { Body } from "./Typography";

export default function Loading({
   message = "Loading...",
   size = "large",
   isLoading = true,
   children,
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      container: {
         flex: 1,
         justifyContent: "center",
         alignItems: "center",
         backgroundColor: theme.background,
      },
      message: {
         marginTop: 16,
         color: theme.textSecondary,
      },
   });

   return (
      <View>
         {isLoading ? (
            <View style={styles.container}>
               <ActivityIndicator size={size} color={theme.primary} />
               <Body style={styles.message}>{message}</Body>
            </View>
         ) : (
            children
         )}
      </View>
   );
}
