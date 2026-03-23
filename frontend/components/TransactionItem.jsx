import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "./ThemeProvider";
import { useRouter } from "expo-router";

const TransactionItem = ({ transaction }) => {
   const { theme } = useTheme();

   // Helper function to calculate total from products
   const calculateTotal = (products) => {
      return products.reduce((sum, item) => {
         const price = item.product?.price || 0;
         const quantity = item.quantity || 0;
         return sum + price * quantity;
      }, 0);
   };

   // Helper function to format date
   const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
         month: "short",
         day: "numeric",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      });
   };

   const styles = StyleSheet.create({
      transactionCard: {
         backgroundColor: theme.bg2,
         borderRadius: 12,
         padding: 16,
         marginHorizontal: 20,
         marginVertical: 8,
         borderLeftWidth: 4,
         borderLeftColor: theme.primary,
      },
      transactionHeader: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: 12,
      },
      sellerName: {
         fontSize: 16,
         fontWeight: "600",
         color: theme.textPrimary,
      },
      transactionAmount: {
         fontSize: 16,
         fontWeight: "bold",
         color: theme.success,
      },
      transactionMeta: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
      },
      metaText: {
         fontSize: 13,
         color: theme.textSecondary,
      },
      statusBadge: {
         paddingHorizontal: 8,
         paddingVertical: 4,
         borderRadius: 4,
         backgroundColor: theme.secondary,
      },
      statusText: {
         fontSize: 12,
         fontWeight: "600",
         color: "#fff",
      },
   });

   const total = calculateTotal(transaction.products);
   const itemCount = transaction.products.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
   );

   const router = useRouter();

   return (
      <TouchableOpacity
         onPress={() => router.push(`/transactions/${transaction._id}`)}
      >
         <View style={styles.transactionCard}>
            <View style={styles.transactionHeader}>
               <Text style={styles.sellerName}>
                  {transaction.seller?.username || "Unknown"}
               </Text>
               <Text style={styles.transactionAmount}>₱{total.toFixed(2)}</Text>
            </View>
            <View style={styles.transactionMeta}>
               <Text style={styles.metaText}>
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
               </Text>
               <Text style={styles.metaText}>
                  {formatDate(transaction.createdAt)}
               </Text>
               <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>
                     {transaction.status?.toUpperCase() || "PENDING"}
                  </Text>
               </View>
            </View>
         </View>
      </TouchableOpacity>
   );
};

export default TransactionItem;
