import { View } from "react-native";
import Button from "../ui/Button";

export default function ActionButtons({
   status,
   onFinalize,
   onCancel,
   styles,
}) {
   if (status !== "pending") return null;
   return (
      <View style={styles.actionRow}>
         <Button
            title="Cancel"
            variant="error"
            onPress={onCancel}
            style={{ flex: 1 }}
            textStyle={{
               textAlign: "center",
            }}
         />
         <Button
            title="Finalize"
            variant="success"
            onPress={onFinalize}
            style={{ flex: 1 }}
         />
      </View>
   );
}
