import { Redirect, Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { Loading } from "../../components/ui";
import { View } from "react-native";

function TabIcon({ name, focused, color, size, theme }) {
  return (
    <View
      style={
        focused
          ? {
              backgroundColor: theme.isDark ? "#1e3a5f" : "#dbeafe",
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
            }
          : {}
      }
    >
      <MaterialIcons name={name} size={size} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.isDark ? "#93c5fd" : "#1d4ed8",
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 80,
          paddingBottom: 16,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="home"
              focused={focused}
              color={color}
              size={size}
              theme={theme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="inventory"
              focused={focused}
              color={color}
              size={size}
              theme={theme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="shopping-cart"
              focused={focused}
              color={color}
              size={size}
              theme={theme}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name="analytics"
              focused={focused}
              color={color}
              size={size}
              theme={theme}
            />
          ),
        }}
      />
    </Tabs>
  );
}
