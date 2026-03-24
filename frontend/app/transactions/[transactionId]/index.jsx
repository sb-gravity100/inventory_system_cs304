import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import { Loading } from "../../../components/ui";
import { useEffect, useState } from "react";
import axios from "axios";
import * as Print from "expo-print";
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

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildReceiptHtml(transaction, subtotal, discount, total) {
  const rows = transaction.products
    .map(
      (item) => `
      <tr>
        <td>${item.product?.name || "Unknown"}</td>
        <td style="text-align:center">×${item.quantity}</td>
        <td style="text-align:right">&#8369;${((item.price_at_sale || item.product?.price || 0) * item.quantity).toFixed(2)}</td>
      </tr>`
    )
    .join("");

  const discountRow =
    discount > 0
      ? `<tr><td colspan="2">Discount</td><td style="text-align:right; color:#dc2626">-&#8369;${discount.toFixed(2)}</td></tr>`
      : "";

  const notesRow = transaction.notes
    ? `<p style="font-size:11px; color:#6b7280; margin:0 0 4px">Note: ${transaction.notes}</p>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    @page { size: 88mm 125mm; margin: 4mm; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 13px;
      margin: 0;
      padding: 24px 16px;
      color: #111;
      max-width: 320px;
      margin: 0 auto;
    }
    h1 { font-size: 20px; text-align: center; margin: 0 0 2px; letter-spacing: 2px; }
    .sub { font-size: 11px; text-align: center; color: #6b7280; margin: 0 0 12px; }
    hr { border: none; border-top: 1px dashed #9ca3af; margin: 10px 0; }
    .meta { font-size: 11px; color: #374151; margin: 2px 0; }
    .meta-id { font-size: 10px; color: #6b7280; word-break: break-all; margin: 4px 0 8px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 4px 2px; vertical-align: top; }
    td:first-child { width: 55%; }
    td:nth-child(2) { width: 15%; }
    td:last-child { width: 30%; }
    .totals td { font-size: 12px; }
    .total-final td { font-size: 15px; font-weight: bold; padding-top: 6px; }
    .status { text-align: center; font-size: 11px; color: #6b7280; margin: 8px 0 4px; }
    .thanks { text-align: center; font-size: 12px; font-style: italic; color: #6b7280; margin-top: 8px; }
  </style>
</head>
<body>
  <h1>IL VENTO</h1>
  <p class="sub">Sales Receipt</p>
  <hr/>
  <p class="meta">Date: ${formatDate(transaction.createdAt)}</p>
  <p class="meta">Served by: ${transaction.seller?.username || "—"}</p>
  <p class="meta-id">Ref: ${transaction._id}</p>
  <hr/>
  <table>
    <tbody>${rows}</tbody>
  </table>
  <hr/>
  <table class="totals">
    <tbody>
      ${discount > 0 ? `<tr><td colspan="2">Subtotal</td><td style="text-align:right">&#8369;${subtotal.toFixed(2)}</td></tr>` : ""}
      ${discountRow}
      <tr class="total-final"><td colspan="2">TOTAL</td><td style="text-align:right">&#8369;${total.toFixed(2)}</td></tr>
    </tbody>
  </table>
  <hr/>
  ${notesRow}
  <p class="status">${transaction.payment_method?.toUpperCase() || "CASH"} · ${transaction.status?.toUpperCase()}</p>
  <hr/>
  <p class="thanks">Thank you for your purchase!</p>
</body>
</html>`;
}

export default function TransactionDetail() {
  const { theme } = useTheme();
  const { authState } = useAuth();
  const { transactionId } = useLocalSearchParams();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);

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
      console.debug("[TransactionDetail] loaded:", transactionId);
    } catch (err) {
      console.error("[TransactionDetail] fetch error:", err.message);
      Alert.alert("Error", "Failed to fetch transaction details");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!transaction) return;
    try {
      setPrinting(true);
      console.info("[TransactionDetail] printing receipt:", transactionId);
      const html = buildReceiptHtml(transaction, subtotal, discount, total);
      await Print.printAsync({ html, width: 249, height: 354 }); // ISO B7
    } catch (err) {
      console.error("[TransactionDetail] print error:", err.message);
      Alert.alert("Print failed", err.message);
    } finally {
      setPrinting(false);
    }
  };

  const subtotal = (transaction?.products || []).reduce(
    (sum, item) =>
      sum +
      (item.price_at_sale || item.product?.price || 0) * (item.quantity || 0),
    0
  );
  const discount = transaction?.discount || 0;
  const total = Math.max(0, subtotal - discount);

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
      alignItems: "center",
    },
    // Receipt paper
    paper: {
      backgroundColor: theme.isDark ? "#1e2330" : "#ffffff",
      borderRadius: 2,
      width: "100%",
      maxWidth: 360,
      paddingHorizontal: 24,
      paddingVertical: 28,
      // Subtle shadow
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.4 : 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
    storeName: {
      fontFamily: Font.bold,
      fontSize: 22,
      color: theme.textPrimary,
      textAlign: "center",
      letterSpacing: 3,
      marginBottom: 2,
    },
    storeTagline: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.textSecondary,
      textAlign: "center",
      marginBottom: 16,
    },
    dash: {
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.isDark ? "#374151" : "#d1d5db",
      marginVertical: 12,
    },
    metaLabel: {
      fontFamily: Font.regular,
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    metaValue: {
      fontFamily: Font.semiBold,
      fontSize: 13,
      color: theme.textPrimary,
      marginBottom: 4,
    },
    idText: {
      fontFamily: Font.regular,
      fontSize: 10,
      color: theme.textSecondary,
      marginBottom: 4,
      lineHeight: 15,
    },
    // Items
    itemRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    itemName: {
      fontFamily: Font.regular,
      fontSize: 13,
      color: theme.textPrimary,
      flex: 1,
      paddingRight: 8,
    },
    itemQty: {
      fontFamily: Font.regular,
      fontSize: 12,
      color: theme.textSecondary,
      width: 32,
      textAlign: "center",
    },
    itemPrice: {
      fontFamily: Font.semiBold,
      fontSize: 13,
      color: theme.textPrimary,
      width: 72,
      textAlign: "right",
    },
    // Totals
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    totalLabel: {
      fontFamily: Font.regular,
      fontSize: 13,
      color: theme.textSecondary,
    },
    totalValue: {
      fontFamily: Font.regular,
      fontSize: 13,
      color: theme.textPrimary,
    },
    discountValue: {
      fontFamily: Font.semiBold,
      fontSize: 13,
      color: theme.isDark ? "#f87171" : "#dc2626",
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 6,
      paddingTop: 8,
      borderTopWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.isDark ? "#374151" : "#d1d5db",
    },
    grandTotalLabel: {
      fontFamily: Font.bold,
      fontSize: 16,
      color: theme.textPrimary,
      letterSpacing: 1,
    },
    grandTotalValue: {
      fontFamily: Font.bold,
      fontSize: 20,
      color: theme.currency,
    },
    // Footer
    footerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    footerText: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.textSecondary,
    },
    statusText: {
      fontFamily: Font.semiBold,
      fontSize: 11,
    },
    notesText: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.textSecondary,
      fontStyle: "italic",
      marginBottom: 4,
    },
    thanksText: {
      fontFamily: Font.regular,
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
      fontStyle: "italic",
      marginTop: 4,
    },
  });

  const STATUS_COLOR = {
    completed: theme.statusCompleted,
    pending: theme.statusPending,
    cancelled: theme.statusCancelled,
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Receipt</Text>
        <TouchableOpacity onPress={handlePrint} disabled={printing || !transaction}>
          <MaterialIcons
            name="print"
            size={24}
            color={printing || !transaction ? theme.textSecondary : theme.textPrimary}
          />
        </TouchableOpacity>
      </View>

      <Loading isLoading={loading} message="Loading receipt...">
        {transaction && (
          <ScrollView contentContainerStyle={s.content}>
            <View style={s.paper}>
              {/* Store header */}
              <Text style={s.storeName}>IL VENTO</Text>
              <Text style={s.storeTagline}>Sales Receipt</Text>

              <View style={s.dash} />

              {/* Meta */}
              <Text style={s.metaLabel}>Date</Text>
              <Text style={s.metaValue}>{formatDate(transaction.createdAt)}</Text>
              <Text style={s.metaLabel}>Served by</Text>
              <Text style={s.metaValue}>{transaction.seller?.username || "—"}</Text>
              <Text style={s.metaLabel}>Reference</Text>
              <Text style={s.idText}>{transactionId}</Text>

              <View style={s.dash} />

              {/* Items */}
              {transaction.products.map((item, index) => (
                <View key={`${item.product?._id}-${index}`} style={s.itemRow}>
                  <Text style={s.itemName} numberOfLines={2}>
                    {item.product?.name || "Unknown"}
                  </Text>
                  <Text style={s.itemQty}>×{item.quantity}</Text>
                  <Text style={s.itemPrice}>
                    ₱
                    {(
                      (item.price_at_sale || item.product?.price || 0) *
                      item.quantity
                    ).toFixed(2)}
                  </Text>
                </View>
              ))}

              <View style={s.dash} />

              {/* Totals */}
              {discount > 0 && (
                <>
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Subtotal</Text>
                    <Text style={s.totalValue}>₱{subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Discount</Text>
                    <Text style={s.discountValue}>−₱{discount.toFixed(2)}</Text>
                  </View>
                </>
              )}
              <View style={s.grandTotalRow}>
                <Text style={s.grandTotalLabel}>TOTAL</Text>
                <Text style={s.grandTotalValue}>₱{total.toFixed(2)}</Text>
              </View>

              <View style={s.dash} />

              {/* Footer */}
              <View style={s.footerRow}>
                <Text style={s.footerText}>
                  {transaction.payment_method?.toUpperCase() || "CASH"}
                </Text>
                <Text
                  style={[
                    s.statusText,
                    { color: STATUS_COLOR[transaction.status] || theme.textSecondary },
                  ]}
                >
                  {transaction.status?.toUpperCase()}
                </Text>
              </View>
              {!!transaction.notes && (
                <Text style={s.notesText}>"{transaction.notes}"</Text>
              )}

              <View style={s.dash} />

              <Text style={s.thanksText}>Thank you for your purchase!</Text>
            </View>
          </ScrollView>
        )}
      </Loading>
    </SafeAreaView>
  );
}
