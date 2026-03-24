import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { Loading } from "../../../components/ui";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Font, FontSize, Spacing, Radius } from "../../../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

const STATUS_COLORS = (theme) => ({
  completed: theme.statusCompleted,
  pending: theme.statusPending,
  cancelled: theme.statusCancelled,
});

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TransactionDetail() {
  const { theme } = useTheme();
  const { authState } = useAuth();
  const { transactionId } = useLocalSearchParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransaction();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${api_url}/sales/transaction/${transactionId}`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setTransaction(res.data);
    } catch {
      Alert.alert("Error", "Failed to fetch transaction details");
    } finally {
      setLoading(false);
    }
  };

  const total = (transaction?.products || []).reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  const statusColors = STATUS_COLORS(theme);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.screenPadding,
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
    },
    headerTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
      flex: 1,
    },
    content: {
      paddingHorizontal: Spacing.screenPadding,
      paddingBottom: 60,
    },
    sectionLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.sectionLabel,
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: Spacing.sm,
      marginTop: Spacing.sectionGap,
    },
    receiptCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.modal,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    receiptHeader: {
      padding: Spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    receiptId: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    receiptSeller: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
      marginBottom: 2,
    },
    receiptDate: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
    statusBadge: {
      alignSelf: "flex-start",
      marginTop: Spacing.sm,
    },
    statusText: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
    },
    receiptRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    receiptRowName: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      flex: 1,
    },
    receiptRowQty: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      marginHorizontal: Spacing.sm,
    },
    receiptRowPrice: {
      fontFamily: Font.bold,
      fontSize: FontSize.body,
      color: theme.currency,
      minWidth: 72,
      textAlign: "right",
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: Spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    totalLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
    },
    totalValue: {
      fontFamily: Font.bold,
      fontSize: FontSize.statValue,
      color: theme.currency,
    },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Transaction</Text>
      </View>

      <Loading isLoading={loading} message="Loading transaction...">
        {transaction && (
          <ScrollView contentContainerStyle={s.content}>
            <View style={s.receiptCard}>
              <View style={s.receiptHeader}>
                <Text style={s.receiptId}>{transactionId}</Text>
                <Text style={s.receiptSeller}>
                  {transaction.seller?.username || "Unknown"}
                </Text>
                <Text style={s.receiptDate}>
                  {formatDate(transaction.createdAt)}
                </Text>
                <View style={s.statusBadge}>
                  <Text
                    style={[
                      s.statusText,
                      {
                        color:
                          statusColors[transaction.status] ||
                          theme.textSecondary,
                      },
                    ]}
                  >
                    {transaction.status}
                  </Text>
                </View>
              </View>

              {transaction.products.map((item, index) => (
                <View key={`${item.product?._id}-${index}`}>
                  {index > 0 && <View style={s.divider} />}
                  <View style={s.receiptRow}>
                    <Text style={s.receiptRowName} numberOfLines={1}>
                      {item.product?.name || "Unknown"}
                    </Text>
                    <Text style={s.receiptRowQty}>×{item.quantity}</Text>
                    <Text style={s.receiptRowPrice}>
                      ₱
                      {(
                        (item.product?.price || 0) * item.quantity
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total</Text>
                <Text style={s.totalValue}>₱{total.toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>
        )}
      </Loading>
    </SafeAreaView>
  );
}
