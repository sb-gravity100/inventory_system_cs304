import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../components/ThemeProvider";
import { AuthProvider } from "../context/AuthContext";
import { PaperProvider } from "react-native-paper";
import ErrorBoundary from "../components/ErrorBoundary";

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
      <ErrorBoundary>
         <PaperProvider>
            <ThemeProvider>
               <AuthProvider>
                  <RootContent />
               </AuthProvider>
            </ThemeProvider>
         </PaperProvider>
      </ErrorBoundary>
   );
}
