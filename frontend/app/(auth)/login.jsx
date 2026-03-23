import { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeProvider";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Input from "../../components/ui/Input";
import PasswordInput from "../../components/PasswordInput";
import Button from "../../components/ui/Button";
import { Font, FontSize, Spacing } from "../../constants/colors";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const passwordRef = useRef(null);

  const { login } = useAuth();
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }
    setIsLoading(true);
    try {
      await login(username.trim(), password.trim());
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert("Login Failed", "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const s = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 32,
    },
    brand: {
      alignItems: "center",
      marginBottom: 48,
    },
    appName: {
      fontFamily: Font.bold,
      fontSize: 36,
      color: theme.textPrimary,
      letterSpacing: 2,
      marginTop: Spacing.md,
      marginBottom: Spacing.xs,
    },
    appSubtitle: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
    },
    form: {
      gap: Spacing.md,
    },
    footer: {
      marginTop: Spacing.xl,
      alignItems: "center",
    },
    footerText: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
  });

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={s.content}>
        <View style={s.brand}>
          <MaterialIcons name="inventory-2" size={44} color={theme.textPrimary} />
          <Text style={s.appName}>il vento</Text>
          <Text style={s.appSubtitle}>Inventory & Sales Management</Text>
        </View>

        <View style={s.form}>
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />
          <PasswordInput
            ref={passwordRef}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Button
            title={isLoading ? "Signing in..." : "Sign In"}
            variant="primary"
            onPress={handleLogin}
            disabled={isLoading}
            style={{ marginTop: Spacing.xs, paddingVertical: 14 }}
          />
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Contact your administrator for access</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
