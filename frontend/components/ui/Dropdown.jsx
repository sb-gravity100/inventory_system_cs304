import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeProvider";

export default function Dropdown({ options = [], value, onChange, label }) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      container: {
         gap: 8,
      },
      label: {
         fontSize: 14,
         fontWeight: "600",
         color: theme.textPrimary,
      },
      optionsContainer: {
         flexDirection: "row",
         gap: 8,
      },
      option: {
         flex: 1,
         paddingVertical: 10,
         paddingHorizontal: 12,
         borderRadius: 8,
         borderWidth: 1,
         borderColor: theme.border,
         alignItems: "center",
      },
      optionActive: {
         backgroundColor: theme.primary,
         borderColor: theme.primary,
      },
      optionText: {
         fontSize: 14,
         color: theme.textPrimary,
         textTransform: "capitalize",
      },
      optionTextActive: {
         color: "#FFFFFF",
         fontWeight: "600",
      },
   });

   return (
      <View style={styles.container}>
         {label && <Text style={styles.label}>{label}</Text>}
         <View style={styles.optionsContainer}>
            {options.map((option) => (
               <TouchableOpacity
                  key={option}
                  style={[
                     styles.option,
                     value === option && styles.optionActive,
                  ]}
                  onPress={() => onChange(option)}
               >
                  <Text
                     style={[
                        styles.optionText,
                        value === option && styles.optionTextActive,
                     ]}
                  >
                     {option}
                  </Text>
               </TouchableOpacity>
            ))}
         </View>
      </View>
   );
}