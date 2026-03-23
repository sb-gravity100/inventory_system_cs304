import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "../components/ThemeProvider";
import { AuthProvider } from "../context/AuthContext";
import { PaperProvider } from "react-native-paper";
import ErrorBoundary from "../components/ErrorBoundary";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { View } from "react-native";

SplashScreen.preventAutoHideAsync();

function RootContent() {
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 200,
        gestureEnabled: true,
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      {/* Auth gate — fade both ways, no directional slide */}
      <Stack.Screen name="(auth)" options={{ animation: "fade", gestureEnabled: false }} />
      {/* Main app — fade in after login */}
      <Stack.Screen name="(tabs)" options={{ animation: "fade", gestureEnabled: false }} />
      {/* Action screen — modal presentation: slides up, swipe-down dismisses */}
      <Stack.Screen name="transaction" options={{ presentation: "modal", gestureEnabled: true }} />
      <Stack.Screen name="add-product" options={{ presentation: "modal", gestureEnabled: true }} />
      <Stack.Screen name="transactions/[transactionId]/index" options={{ animation: "slide_from_right", gestureEnabled: true }} />
      <Stack.Screen name="users" options={{ animation: "slide_from_right", gestureEnabled: true }} />
    </Stack>
    </View>
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
