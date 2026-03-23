import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function QtyControl({
   quantity,
   onIncrease,
   onDecrease,
   onRemove,
   styles,
}) {
   return (
      <View style={styles.qtyRow}>
         <TouchableOpacity style={styles.qtyBtn} onPress={onDecrease}>
            <MaterialIcons name="remove" size={16} color="#fff" />
         </TouchableOpacity>
         <Text style={styles.qtyText}>{quantity}</Text>
         <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease}>
            <MaterialIcons name="add" size={16} color="#fff" />
         </TouchableOpacity>
         <TouchableOpacity
            style={[styles.qtyBtn, { backgroundColor: "#d64045" }]}
            onPress={onRemove}
         >
            <MaterialIcons name="delete" size={16} color="#fff" />
         </TouchableOpacity>
      </View>
   );
}
