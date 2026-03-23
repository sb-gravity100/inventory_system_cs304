import { View } from "react-native";
import { Label } from "./Typography";
import { Spacing } from "../../constants/colors";

export default function FormField({ label, children, style }) {
  return (
    <View style={[{ marginBottom: Spacing.lg }, style]}>
      {label && <Label style={{ marginBottom: Spacing.sm }}>{label}</Label>}
      {children}
    </View>
  );
}