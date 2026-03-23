import { View, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeProvider";
import Header from "../ui/Header";

export default function HomeHeader({
   username,
   role,
   onToggleTheme,
   onLogout,
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      toggleButton: {
         padding: 8,
         borderRadius: 8,
      },
      logoutButton: {
         padding: 8,
         borderRadius: 8,
         backgroundColor: theme.error,
      },
   });

   return (
      <Header
         title={`Welcome, ${username}`}
         subtitle={`${role} Dashboard`}
         rightActions={[
            <TouchableOpacity
               key="theme"
               style={styles.toggleButton}
               onPress={onToggleTheme}
            >
               <MaterialIcons
                  name={theme.isDark ? "light-mode" : "dark-mode"}
                  size={24}
                  color="#FFFFFF"
               />
            </TouchableOpacity>,
            <TouchableOpacity
               key="logout"
               style={styles.logoutButton}
               onPress={onLogout}
            >
               <MaterialIcons name="logout" size={24} color="#FFFFFF" />
            </TouchableOpacity>,
         ]}
      />
   );
}
