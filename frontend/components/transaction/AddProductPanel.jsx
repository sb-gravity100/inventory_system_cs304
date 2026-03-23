import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import SearchBar from "../ui/SearchBar";

export default function AddProductPanel({
   allProducts,
   onAdd,
   searchQuery,
   setSearchQuery,
   styles,
}) {
   const filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
   );

   return (
      <View style={{ marginTop: 8 }}>
         <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            style={{ marginBottom: 8 }}
         />
         {filtered.slice(0, 5).map((p) => (
            <View
               key={p._id}
               style={[styles.row, { borderBottomWidth: 0, marginBottom: 6 }]}
            >
               <View style={{ flex: 1 }}>
                  <Text style={styles.value}>{p.name}</Text>
                  <Text style={styles.label}>
                     ₱{p.price.toFixed(2)} · {p.stock} in stock
                  </Text>
               </View>
               <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(p)}>
                  <MaterialIcons name="add" size={18} color="#fff" />
               </TouchableOpacity>
            </View>
         ))}
      </View>
   );
}
