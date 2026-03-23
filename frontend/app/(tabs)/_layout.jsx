import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { Loading } from "../../components/ui";

export default function TabsLayout() {
   const { user, isLoading } = useAuth();
   const { theme } = useTheme();

   if (isLoading) {
      return <Loading />;
   }

   // If user is not authenticated, redirect to login
   if (!user) {
      return <Redirect href="/(auth)/login" />;
   }

   return (
      <Tabs
         screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
               backgroundColor: theme.background,
               borderTopColor: theme.border,
            },
         }}
      >
         <Tabs.Screen
            name="index"
            options={{
               title: "Home",
               tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="home" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="inventory"
            options={{
               title: "Inventory",
               tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="inventory" size={size} color={color} />
               ),
            }}
         />
         <Tabs.Screen
            name="sales"
            options={{
               title: "Sales",
               tabBarIcon: ({ color, size }) => (
                  <MaterialIcons
                     name="shopping-cart"
                     size={size}
                     color={color}
                  />
               ),
            }}
         />
         <Tabs.Screen
            name="reports"
            options={{
               title: "Reports",
               tabBarIcon: ({ color, size }) => (
                  <MaterialIcons name="analytics" size={size} color={color} />
               ),
            }}
         />
      </Tabs>
   );
}