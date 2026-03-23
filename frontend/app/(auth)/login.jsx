import { createRef, useState } from "react";
import {
   View,
   TouchableOpacity,
   StyleSheet,
   Alert,
   KeyboardAvoidingView,
   Platform,
} from "react-native";
import { TextInput, Text } from "react-native-paper";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeProvider";
import { router } from "expo-router";

export default function LoginScreen() {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [isLoading, setIsLoading] = useState(false);
   const [secureTextEntry, setSecureTextEntry] = useState(true);
   const passwordInputRef = createRef();

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

   const styles = StyleSheet.create({
      container: {
         flex: 1,
         backgroundColor: theme.background,
      },
      content: {
         flex: 1,
         justifyContent: "center",
         paddingHorizontal: 24,
      },
      logoContainer: {
         alignItems: "center",
         marginBottom: 48,
      },
      logo: {
         fontSize: 48,
         marginBottom: 16,
      },
      title: {
         fontSize: 28,
         fontWeight: "bold",
         color: theme.textPrimary,
         marginBottom: 8,
      },
      subtitle: {
         fontSize: 16,
         color: theme.textSecondary,
      },
      form: {
         gap: 16,
      },
      inputContainer: {
         gap: 8,
      },
      label: {
         fontSize: 14,
         fontWeight: "600",
         color: theme.textPrimary,
      },
      input: {
         backgroundColor:
            theme.background === "#2E2E2E" ? "#3A3A3A" : "#FFFFFF",
         borderWidth: 1,
         borderColor: theme.border,
         borderRadius: 8,
         paddingHorizontal: 16,
         fontSize: 16,
         color: theme.textPrimary,
      },
      loginButton: {
         backgroundColor: theme.primary,
         borderRadius: 8,
         paddingVertical: 16,
         alignItems: "center",
         marginTop: 8,
      },
      loginButtonDisabled: {
         opacity: 0.6,
      },
      loginButtonText: {
         color: "#FFFFFF",
         fontSize: 16,
         fontWeight: "600",
      },
      footer: {
         marginTop: 24,
         alignItems: "center",
      },
      footerText: {
         fontSize: 14,
         color: theme.textSecondary,
      },
   });

   return (
      <KeyboardAvoidingView
         style={styles.container}
         behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
         <View style={styles.content}>
            <View style={styles.logoContainer}>
               <Text style={styles.logo}>📦</Text>
               <Text style={styles.title}>il vento</Text>
               <Text style={styles.subtitle}>
                  Inventory & Sales Management System
               </Text>
            </View>

            <View style={styles.form}>
               <View style={styles.inputContainer}>
                  <Text style={styles.label}>Username</Text>
                  <TextInput
                     style={styles.input}
                     placeholder="Enter your username"
                     placeholderTextColor={theme.textSecondary}
                     value={username}
                     onChangeText={setUsername}
                     autoCapitalize="none"
                     autoCorrect={false}
                     returnKeyType="next"
                     onSubmitEditing={() => passwordInputRef.current.focus()}
                  />
               </View>

               <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <TextInput
                     style={styles.input}
                     placeholder="Enter your password"
                     placeholderTextColor={theme.textSecondary}
                     value={password}
                     onChangeText={setPassword}
                     secureTextEntry={secureTextEntry}
                     autoCapitalize="none"
                     autoCorrect={false}
                     ref={passwordInputRef}
                     returnKeyType="done"
                     onSubmitEditing={handleLogin}
                     right={
                        <TextInput.Icon
                           icon={secureTextEntry ? "eye-off" : "eye"}
                           onPress={() => setSecureTextEntry(!secureTextEntry)}
                        />
                     }
                  />
               </View>

               <TouchableOpacity
                  style={[
                     styles.loginButton,
                     isLoading && styles.loginButtonDisabled,
                  ]}
                  onPress={handleLogin}
                  disabled={isLoading}
               >
                  <Text style={styles.loginButtonText}>
                     {isLoading ? "Logging in..." : "Login"}
                  </Text>
               </TouchableOpacity>
            </View>

            <View style={styles.footer}>
               <Text style={styles.footerText}>
                  Contact your administrator for access
               </Text>
            </View>
         </View>
      </KeyboardAvoidingView>
   );
}
