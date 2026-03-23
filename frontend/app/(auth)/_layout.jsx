import { Redirect, Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeProvider";
import { Loading } from "../../components/ui";

export default function AuthLayout() {
   const { user, isLoading } = useAuth();
   const { theme } = useTheme();

   if (isLoading) {
      return <Loading />;
   }

   if (user) {
      return <Redirect href="/(tabs)" />;
   }

   return (
      <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="login" />
      </Stack>
   );
}
