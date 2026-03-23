import { View, StyleSheet } from "react-native";
import { Label } from "./Typography";

export default function FormField({ label, children, style }) {
   const styles = StyleSheet.create({
      container: {
         marginBottom: 16,
      },
      label: {
         marginBottom: 8,
      },
   });

   return (
      <View style={[styles.container, style]}>
         {label && <Label style={styles.label}>{label}</Label>}
         {children}
      </View>
   );
}