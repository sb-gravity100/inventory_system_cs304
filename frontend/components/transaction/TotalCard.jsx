import { View, Text } from "react-native";
import { Subtitle } from "../ui";

export default function TotalCard({ total, styles }) {
   return (
      <View style={styles.detailCard}>
         <View style={[styles.row, { borderBottomWidth: 0 }]}>
            <Subtitle>Total Amount</Subtitle>
            <Text style={styles.totalAmount}>₱{total.toFixed(2)}</Text>
         </View>
      </View>
   );
}
