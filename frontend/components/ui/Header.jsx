import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Header({
   title,
   subtitle,
   showBack = false,
   rightActions = [],
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      header: {
         paddingTop: 10,
         paddingHorizontal: 20,
         paddingBottom: 20,
         backgroundColor: theme.primary,
      },
      headerTop: {
         flexDirection: "row",
         alignItems: "center",
         gap: 12,
      },
      backButton: {
         padding: 4,
      },
      headerContent: {
         flex: 1,
      },
      headerTitle: {
         fontSize: 24,
         fontWeight: "bold",
         color: "#FFFFFF",
         marginBottom: subtitle ? 4 : 0,
      },
      headerSubtitle: {
         fontSize: 14,
         color: "#FFFFFF",
         opacity: 0.9,
      },
      rightActions: {
         flexDirection: "row",
         gap: 8,
      },
   });

   return (
      <View style={styles.header}>
         <View style={styles.headerTop}>
            {showBack && (
               <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => router.back()}
               >
                  <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
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
