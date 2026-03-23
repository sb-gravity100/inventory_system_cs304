import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../components/ThemeProvider";
import { AuthProvider } from "../context/AuthContext";
import { PaperProvider } from "react-native-paper";

function RootContent() {
   return (
      <>
         <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
         </Stack>
         {/* <ThemeToggleButton /> */}
      </>
   );
}

export default function RootLayout() {
   return (
      <PaperProvider>
         <ThemeProvider>
            <AuthProvider>
               <RootContent />
            </AuthProvider>
         </ThemeProvider>
      </PaperProvider>
   );
}
