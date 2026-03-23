import { View, Text } from "react-native";
import QtyControl from "./QtyControl";

export default function ProductListCard({
   products,
   editable,
   onChangeQty,
   onRemove,
   styles,
}) {
   return (
      <View style={styles.detailCard}>
         {products.map((item, index) => (
            <View key={index} style={styles.productItem}>
               <Text style={styles.productName}>
                  {item.product?.name || "Unknown Product"}
               </Text>
               <View style={styles.productMeta}>
                  <Text style={styles.label}>
                     ₱{(item.product?.price || 0).toFixed(2)}
                  </Text>
                  {editable ? (
                     <QtyControl
                        quantity={item.quantity}
                        onIncrease={() => onChangeQty(index, item.quantity + 1)}
                        onDecrease={() => onChangeQty(index, item.quantity - 1)}
                        onRemove={() => onRemove(index)}
                        styles={styles}
                     />
                  ) : (
                     <Text style={styles.label}>Qty: {item.quantity}</Text>
                  )}
                  <Text style={[styles.value, { color: "#32be86" }]}>
                     ₱{((item.product?.price || 0) * item.quantity).toFixed(2)}
                  </Text>
               </View>
            </View>
         ))}
      </View>
   );
}
