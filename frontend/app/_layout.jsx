import { Stack } from "expo-router";
import { ThemeProvider } from "../components/ThemeProvider";
import { AuthProvider } from "../context/AuthContext";
import { PaperProvider } from "react-native-paper";
import ErrorBoundary from "../components/ErrorBoundary";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootContent() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        gestureEnabled: true,
      }}
    >
      {/* Auth gate — fade both ways, no directional slide */}
      <Stack.Screen name="(auth)" options={{ animation: "fade", gestureEnabled: false }} />
      {/* Main app — fade in after login */}
      <Stack.Screen name="(tabs)" options={{ animation: "fade", gestureEnabled: false }} />
      {/* Action screen — modal presentation: slides up, swipe-down dismisses */}
      <Stack.Screen name="transaction" options={{ presentation: "modal", gestureEnabled: true }} />
      {/* Detail drill-down — slide right in, swipe-left-edge to go back */}
      <Stack.Screen name="transactions/[transactionId]/index" options={{ animation: "slide_from_right", gestureEnabled: true }} />
      {/* Admin utility — same drill-down pattern */}
      <Stack.Screen name="users" options={{ animation: "slide_from_right", gestureEnabled: true }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Outfit-Thin": require("../assets/fonts/Outfit-Thin.ttf"),
    "Outfit-ExtraLight": require("../assets/fonts/Outfit-ExtraLight.ttf"),
    "Outfit-Light": require("../assets/fonts/Outfit-Light.ttf"),
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
    "Outfit-Medium": require("../assets/fonts/Outfit-Medium.ttf"),
    "Outfit-SemiBold": require("../assets/fonts/Outfit-SemiBold.ttf"),
    "Outfit-Bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "Outfit-ExtraBold": require("../assets/fonts/Outfit-ExtraBold.ttf"),
    "Outfit-Black": require("../assets/fonts/Outfit-Black.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

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
