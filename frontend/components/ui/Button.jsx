import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";

export default function Button({
   title,
   onPress,
   variant = "primary",
   icon,
   disabled = false,
   style,
   textStyle,
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      button: {
         flexDirection: "row",
         alignItems: "center",
         justifyContent: "center",
         paddingVertical: 12,
         paddingHorizontal: 12,
         borderRadius: 8,
         gap: 8,
      },
      primary: {
         backgroundColor: theme.primary,
      },
      secondary: {
         backgroundColor: theme.secondary,
      },
      success: {
         backgroundColor: theme.success,
      },
      error: {
         backgroundColor: theme.error,
      },
      warning: {
         backgroundColor: theme.warning,
      },
      outline: {
         backgroundColor: "transparent",
         borderWidth: 1,
         borderColor: theme.primary,
      },
      disabled: {
         opacity: 0.5,
      },
      buttonText: {
         color: "#FFFFFF",
         fontSize: 16,
         fontWeight: "600",
      },
      outlineText: {
         color: theme.primary,
      },
   });

   return (
      <TouchableOpacity
         style={[
            styles.button,
            styles[variant],
            disabled && styles.disabled,
            style,
         ]}
         onPress={onPress}
         disabled={disabled}
      >
         {icon && <MaterialIcons name={icon} size={20} color="#FFFFFF" />}
         <Text
            style={[
               styles.buttonText,
               variant === "outline" && styles.outlineText,
               textStyle,
            ]}
         >
            {title}
         </Text>
      </TouchableOpacity>
   );
}