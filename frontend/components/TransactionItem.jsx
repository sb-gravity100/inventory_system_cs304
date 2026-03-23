import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "./ThemeProvider";
import { useRouter } from "expo-router";
import { Font, FontSize, Spacing } from "../constants/colors";

const TransactionItem = ({ transaction }) => {
  const { theme } = useTheme();
  const router = useRouter();

  const total = transaction.products.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * (item.quantity || 0);
  }, 0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColorMap = {
    completed: theme.statusCompleted,
    pending: theme.statusPending,
    cancelled: theme.statusCancelled,
  };
  const statusColor =
    statusColorMap[transaction.status] || theme.textSecondary;

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    left: { flex: 1 },
    seller: {
      fontFamily: Font.medium,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
    },
    meta: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginTop: 2,
    },
    status: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
    },
    amount: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.currency,
      marginRight: 4,
    },
  });

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/transactions/${transaction._id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.seller}>
          {transaction.seller?.username || "Unknown"}
        </Text>
        <Text style={styles.meta}>
          {formatDate(transaction.createdAt)}
          {"  ·  "}
          <Text style={[styles.status, { color: statusColor }]}>
            {transaction.status}
          </Text>
        </Text>
      </View>
      <Text style={styles.amount}>₱{total.toFixed(2)}</Text>
      <MaterialIcons name="chevron-right" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  );
};

export default TransactionItem;
