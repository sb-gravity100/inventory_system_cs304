import { View, Text } from "react-native";
import { Subtitle } from "../ui";

function InfoRow({ label, value, valueStyle, last, styles }) {
   return (
      <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
         <Text style={styles.label}>{label}</Text>
         <Text style={[styles.value, valueStyle]}>{value}</Text>
      </View>
   );
}

export function getStatusColor(status) {
   if (status === "completed") return "#32be86";
   if (status === "cancelled") return "#d64045";
   return "#D9B26C";
}

export default function TransactionInfoCard({ transaction, styles }) {
   return (
      <View style={styles.detailCard}>
         <InfoRow
            label="Transaction ID"
            value={transaction._id}
            styles={styles}
         />
         <InfoRow
            label="Seller"
            value={transaction.seller?.username || "Unknown"}
            styles={styles}
         />
         <InfoRow
            label="Status"
            value={transaction.status?.toUpperCase() || "PENDING"}
            valueStyle={{ color: getStatusColor(transaction.status) }}
            styles={styles}
         />
         <InfoRow
            label="Date"
            value={new Date(transaction.createdAt).toLocaleDateString()}
            styles={styles}
            last
         />
      </View>
   );
}
