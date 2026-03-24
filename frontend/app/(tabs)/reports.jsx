import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/home/StatCard";
import TransactionItem from "../../components/TransactionItem";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import axios from "axios";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

const LOG_GROUPS = [
  { key: "all", label: "All" },
  { key: "transactions", label: "Transactions" },
  { key: "inventory", label: "Inventory" },
  { key: "users", label: "Users" },
];

const EVENT_COLOR = {
  TRANSACTION_CREATED: "#1d4ed8",
  TRANSACTION_UPDATED: "#1d4ed8",
  TRANSACTION_COMPLETED: "#15803d",
  TRANSACTION_CANCELLED: "#6b7280",
  PRODUCT_CREATED: "#d97706",
  PRODUCT_UPDATED: "#d97706",
  PRODUCT_DELETED: "#dc2626",
  STOCK_INCREASE: "#15803d",
  STOCK_DECREASE: "#dc2626",
  STOCK_SET: "#d97706",
  STOCK_SOLD: "#15803d",
  USER_LOGIN: "#7c3aed",
  USER_LOGOUT: "#7c3aed",
  USER_CREATED: "#7c3aed",
  USER_UPDATED: "#7c3aed",
  USER_DELETED: "#dc2626",
  USER_PASSWORD_CHANGED: "#7c3aed",
};

const EVENT_LABEL = {
  TRANSACTION_CREATED: "New Tx",
  TRANSACTION_UPDATED: "Tx Updated",
  TRANSACTION_COMPLETED: "Completed",
  TRANSACTION_CANCELLED: "Cancelled",
  PRODUCT_CREATED: "Product+",
  PRODUCT_UPDATED: "Product~",
  PRODUCT_DELETED: "Product-",
  STOCK_INCREASE: "Stock+",
  STOCK_DECREASE: "Stock-",
  STOCK_SET: "Stock Set",
  STOCK_SOLD: "Sold",
  USER_LOGIN: "Login",
  USER_LOGOUT: "Logout",
  USER_CREATED: "User+",
  USER_UPDATED: "User~",
  USER_DELETED: "User-",
  USER_PASSWORD_CHANGED: "Pwd Chg",
};

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function buildDailyData(transactions, mode) {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(now);
    dayStart.setDate(now.getDate() - (6 - i));
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayStart.getDate() + 1);

    const dayTxs = transactions.filter((tx) => {
      const d = new Date(tx.createdAt);
      return d >= dayStart && d < dayEnd && tx.status === "completed";
    });

    const revenue = dayTxs.reduce(
      (sum, tx) =>
        sum +
        tx.products.reduce(
          (s, p) =>
            s + (p.quantity || 0) * (p.price_at_sale || p.product?.price || 0),
          0
        ),
      0
    );

    return {
      label: DAY_LABELS[dayStart.getDay()],
      value: mode === "revenue" ? revenue : dayTxs.length,
      isToday: i === 6,
    };
  });
}

// ── Custom bar chart (no external dep) ────────────────────────────────────────
function BarChart({ data, barColor, primaryText, secondaryText, labelFn }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const BAR_MAX_H = 72;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        height: BAR_MAX_H + 44,
        gap: 4,
        paddingHorizontal: 4,
      }}
    >
      {data.map((d, i) => {
        const barH = d.value > 0
          ? Math.max((d.value / maxVal) * BAR_MAX_H, 5)
          : 0;
        return (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            {/* value label above bar */}
            <Text
              style={{
                fontSize: 8,
                color: secondaryText,
                marginBottom: 2,
                textAlign: "center",
                height: 12,
              }}
              numberOfLines={1}
            >
              {d.value > 0 ? (labelFn ? labelFn(d.value) : d.value) : ""}
            </Text>
            {/* bar fill area */}
            <View
              style={{ height: BAR_MAX_H, width: "100%", justifyContent: "flex-end" }}
            >
              <View
                style={{
                  width: "100%",
                  height: barH,
                  backgroundColor: barH > 0 ? barColor : "transparent",
                  borderRadius: 3,
                  opacity: d.isToday ? 1 : 0.5,
                }}
              />
            </View>
            {/* day label */}
            <Text
              style={{
                fontSize: 11,
                marginTop: 5,
                color: d.isToday ? primaryText : secondaryText,
                fontFamily: d.isToday ? Font.semiBold : Font.regular,
              }}
            >
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── PDF helpers ────────────────────────────────────────────────────────────────
function buildPdfHtml(title, tableHeaders, rows) {
  const date = new Date().toLocaleDateString("en-PH", { dateStyle: "long" });
  const thHtml = tableHeaders.map((h) => `<th>${h}</th>`).join("");
  const rowsHtml = rows
    .map((row) => `<tr>${row.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;padding:20px;color:#111827}
  h1{font-size:16px;color:#1a2235;margin:0 0 2px}
  .sub{color:#6b7280;font-size:10px;margin-bottom:16px}
  table{width:100%;border-collapse:collapse}
  th{background:#1a2235;color:#fff;padding:6px 8px;text-align:left;font-size:10px;
     text-transform:uppercase;letter-spacing:0.5px}
  td{padding:5px 8px;border-bottom:1px solid #e5e7eb;font-size:10px}
  tr:nth-child(even) td{background:#f9fafb}
  .footer{margin-top:16px;font-size:9px;color:#9ca3af;text-align:right}
</style></head><body>
  <h1>Il Vento — ${title}</h1>
  <div class="sub">Generated on ${date} · ${rows.length} records</div>
  <table><thead><tr>${thHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>
  <div class="footer">Il Vento Inventory Management System</div>
</body></html>`;
}

function formatLogDate(iso) {
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-PH", { month: "short", day: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit" })
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const { theme } = useTheme();
  const { authState, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // manager/admin state
  const [revenueStats, setRevenueStats] = useState(null);

  // staff state
  const [myTransactions, setMyTransactions] = useState([]);
  const [chartMode, setChartMode] = useState("revenue"); // "revenue" | "count"

  // shared audit log state
  const [auditLogs, setAuditLogs] = useState([]);
  const [logGroup, setLogGroup] = useState("all");
  const [logLoading, setLogLoading] = useState(false);

  // export state
  const [exporting, setExporting] = useState(null);

  const isManagerOrAdmin =
    user?.role === "manager" || user?.role === "admin";
  const isAdmin = user?.role === "admin";
  const headers = { Authorization: `Bearer ${authState.token}` };

  const isMounted = useRef(false);

  // ── init once the role is known ───────────────────────────────────────────
  useEffect(() => {
    if (!user) return; // wait for auth context to load
    isMounted.current = true;
    init();
  }, [user?.role]); // re-run if role changes (login/logout)

  // ── reload logs when group changes (skip first render) ────────────────────
  const isFirstGroupChange = useRef(true);
  useEffect(() => {
    if (isFirstGroupChange.current) {
      isFirstGroupChange.current = false;
      return;
    }
    fetchLogs(logGroup);
  }, [logGroup]);

  // ── refresh on tab focus ───────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      if (!isMounted.current || !user) return;
      if (isManagerOrAdmin) {
        fetchRevenueStats();
      } else {
        fetchMyTransactions();
      }
    }, [isManagerOrAdmin]) // must not be [] — captures correct role on every change
  );

  const init = async () => {
    setLoading(true);
    try {
      const tasks = [fetchLogs("all")];
      if (isManagerOrAdmin) {
        tasks.push(fetchRevenueStats());
      } else {
        tasks.push(fetchMyTransactions());
      }
      await Promise.all(tasks);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueStats = async () => {
    try {
      const res = await axios.get(`${api_url}/sales/revenue-stats`, { headers });
      setRevenueStats(res.data);
    } catch (e) {
      console.error("[reports] revenue-stats error:", e);
    }
  };

  const fetchMyTransactions = async () => {
    try {
      const res = await axios.get(`${api_url}/sales/transactions`, { headers });
      setMyTransactions(res.data || []);
    } catch (e) {
      console.error("[reports] my-transactions error:", e);
    }
  };

  const fetchLogs = async (group) => {
    setLogLoading(true);
    try {
      const params = { limit: 25 };
      if (group !== "all") params.group = group;
      const res = await axios.get(`${api_url}/sales/audit-logs`, {
        headers,
        params,
      });
      setAuditLogs(res.data.logs || []);
    } catch (e) {
      console.error("[reports] audit-logs error:", e);
    } finally {
      setLogLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await init();
    setRefreshing(false);
  };

  const handleGroupChange = (key) => {
    setLogGroup(key);
    fetchLogs(key);
  };

  // ── staff performance computations ────────────────────────────────────────
  const perf = useMemo(() => {
    if (!myTransactions.length) return null;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const completed = myTransactions.filter((tx) => tx.status === "completed");
    const calcRev = (txs) =>
      txs.reduce(
        (sum, tx) =>
          sum +
          tx.products.reduce(
            (s, p) =>
              s +
              (p.quantity || 0) * (p.price_at_sale || p.product?.price || 0),
            0
          ),
        0
      );

    return {
      completedCount: completed.length,
      pendingCount: myTransactions.filter((tx) => tx.status === "pending").length,
      cancelledCount: myTransactions.filter((tx) => tx.status === "cancelled")
        .length,
      totalRevenue: calcRev(completed),
      weekRevenue: calcRev(
        completed.filter((tx) => new Date(tx.createdAt) >= startOfWeek)
      ),
      totalItems: completed.reduce(
        (sum, tx) =>
          sum + tx.products.reduce((s, p) => s + (p.quantity || 0), 0),
        0
      ),
    };
  }, [myTransactions]);

  const dailyData = useMemo(
    () => buildDailyData(myTransactions, chartMode),
    [myTransactions, chartMode]
  );

  const managerDailyData = useMemo(() => {
    if (!revenueStats?.dailyData) return [];
    return revenueStats.dailyData.map((d) => ({
      label: d.label,
      value: chartMode === "revenue" ? d.revenue : d.count,
      isToday: d.isToday,
    }));
  }, [revenueStats, chartMode]);

  const recentTxs = useMemo(() => myTransactions.slice(0, 5), [myTransactions]);

  // ── export helpers ────────────────────────────────────────────────────────
  const generateAndShare = async (exportKey, title, tableHeaders, fetchData, mapRow) => {
    if (exporting) return;
    setExporting(exportKey);
    try {
      const data = await fetchData();
      const html = buildPdfHtml(title, tableHeaders, data.map(mapRow));
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Share ${title}`,
        UTI: "com.adobe.pdf",
      });
    } catch (e) {
      console.error("[reports] export error:", e);
      Alert.alert("Export Failed", "Could not generate the report. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  const handleExportTransactions = () =>
    generateAndShare(
      "transactions",
      "Transactions Report",
      ["Date", "Seller", "Items", "Total (₱)", "Status"],
      async () => {
        const res = await axios.get(`${api_url}/sales/transactions`, { headers });
        return res.data || [];
      },
      (tx) => [
        new Date(tx.createdAt).toLocaleDateString("en-PH"),
        tx.seller?.username || "-",
        tx.products?.reduce((s, p) => s + (p.quantity || 0), 0) || 0,
        (
          tx.products?.reduce(
            (s, p) =>
              s +
              (p.quantity || 0) * (p.price_at_sale || p.product?.price || 0),
            0
          ) || 0
        ).toFixed(2),
        tx.status,
      ]
    );

  const handleExportInventory = () =>
    generateAndShare(
      "inventory",
      "Inventory Report",
      ["Name", "SKU", "Price (₱)", "Cost (₱)", "Stock", "Threshold"],
      async () => {
        const res = await axios.get(`${api_url}/products`, {
          headers,
          params: { limit: 1000 },
        });
        return res.data.products || [];
      },
      (p) => [
        p.name,
        p.sku || "-",
        (p.price || 0).toFixed(2),
        (p.costPrice || 0).toFixed(2),
        p.stock,
        p.low_stock_threshold || 10,
      ]
    );

  const handleExportLowStock = () =>
    generateAndShare(
      "lowstock",
      "Low Stock Report",
      ["Name", "SKU", "Stock", "Threshold", "Price (₱)"],
      async () => {
        const res = await axios.get(`${api_url}/products`, {
          headers,
          params: { limit: 1000 },
        });
        const all = res.data.products || [];
        return all.filter((p) => p.stock <= (p.low_stock_threshold || 10));
      },
      (p) => [
        p.name,
        p.sku || "-",
        p.stock,
        p.low_stock_threshold || 10,
        (p.price || 0).toFixed(2),
      ]
    );

  const handleExportAuditLog = () =>
    generateAndShare(
      "audit",
      "Audit Log",
      ["Timestamp", "Event", "Actor", "Message"],
      async () => {
        const res = await axios.get(`${api_url}/sales/audit-logs`, {
          headers,
          params: { limit: 500 },
        });
        return res.data.logs || [];
      },
      (log) => [
        new Date(log.timestamp).toLocaleString("en-PH"),
        log.event,
        log.actor?.username || "-",
        log.message,
      ]
    );

  // ── styles ────────────────────────────────────────────────────────────────
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { paddingBottom: 32 },
    loadingCenter: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: {
      paddingHorizontal: Spacing.screenPadding,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
    },
    screenTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
    },
    sectionLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.sectionLabel,
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      paddingHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sm,
    },
    section: {
      paddingHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sectionGap,
    },
    statsRow: { flexDirection: "row" },
    // Breakdown bar (manager/admin)
    breakdownCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      flexDirection: "row",
      overflow: "hidden",
      marginTop: Spacing.listGap,
    },
    breakdownItem: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: "center",
    },
    breakdownValue: {
      fontFamily: Font.bold,
      fontSize: FontSize.statValue,
      marginBottom: 2,
    },
    breakdownLabel: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
    breakdownSep: { width: 1, backgroundColor: theme.border },
    // Top products (manager/admin)
    topCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      marginHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sectionGap,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.cardPadding,
      paddingVertical: Spacing.sm,
    },
    topRank: {
      fontFamily: Font.bold,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      width: 22,
    },
    topName: {
      flex: 1,
      fontFamily: Font.medium,
      fontSize: FontSize.body,
      color: theme.textPrimary,
    },
    topQty: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.currency,
    },
    topQtyLabel: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
    // Export buttons (manager/admin)
    exportCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      marginHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sectionGap,
    },
    exportBtn: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.cardPadding,
      paddingVertical: Spacing.md,
    },
    exportBtnDisabled: { opacity: 0.45 },
    exportIcon: { fontSize: 16, width: 28 },
    exportLabel: {
      flex: 1,
      fontFamily: Font.medium,
      fontSize: FontSize.body,
      color: theme.textPrimary,
    },
    exportArrow: {
      fontFamily: Font.regular,
      fontSize: 18,
      color: theme.textSecondary,
    },
    // Chart card (staff)
    chartCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      marginHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sectionGap,
      paddingHorizontal: Spacing.cardPadding,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    chartHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.sm,
    },
    chartTitle: {
      flex: 1,
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
    },
    chartToggleRow: { flexDirection: "row", gap: Spacing.xs },
    chartToggle: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: 4,
      borderWidth: 1,
    },
    chartToggleText: {
      fontFamily: Font.medium,
      fontSize: 11,
    },
    // Generic card
    card: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
      marginHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sectionGap,
    },
    // Chip row (audit log filter + chart toggle)
    chipRow: {
      flexDirection: "row",
      gap: Spacing.xs,
      paddingHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sm,
    },
    chip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: 5,
      borderRadius: 999,
      borderWidth: 1,
    },
    chipText: {
      fontFamily: Font.medium,
      fontSize: FontSize.listSecondary,
    },
    // Log items
    logItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingHorizontal: Spacing.cardPadding,
      paddingVertical: Spacing.sm,
      gap: Spacing.sm,
    },
    logBadge: {
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 3,
      minWidth: 68,
      alignItems: "center",
    },
    logBadgeText: {
      fontFamily: Font.semiBold,
      fontSize: 9,
      color: "#fff",
      letterSpacing: 0.2,
    },
    logContent: { flex: 1 },
    logMessage: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textPrimary,
      lineHeight: 18,
    },
    logMeta: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.textSecondary,
      marginTop: 2,
    },
    logEmpty: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      textAlign: "center",
      paddingVertical: Spacing.xl,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },
    logSpinner: { paddingVertical: Spacing.lg },
  });

  // ── sub-components ────────────────────────────────────────────────────────
  const Chip = ({ label, active, onPress }) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        s.chip,
        {
          backgroundColor: active ? theme.primary : theme.surface,
          borderColor: active ? theme.primary : theme.border,
        },
      ]}
      activeOpacity={0.7}
    >
      <Text
        style={[s.chipText, { color: active ? "#fff" : theme.textSecondary }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const ExportButton = ({ icon, label, exportKey, onPress }) => {
    const isBusy = exporting === exportKey;
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!!exporting}
        style={[s.exportBtn, !!exporting && s.exportBtnDisabled]}
        activeOpacity={0.7}
      >
        <Text style={s.exportIcon}>{icon}</Text>
        <Text style={s.exportLabel}>{label}</Text>
        {isBusy ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Text style={s.exportArrow}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  const LogItem = ({ log, showDivider }) => {
    const color = EVENT_COLOR[log.event] || theme.textSecondary;
    const label = EVENT_LABEL[log.event] || log.event;
    return (
      <>
        {showDivider && <View style={s.divider} />}
        <View style={s.logItem}>
          <View style={[s.logBadge, { backgroundColor: color }]}>
            <Text style={s.logBadgeText} numberOfLines={1}>
              {label}
            </Text>
          </View>
          <View style={s.logContent}>
            <Text style={s.logMessage}>{log.message}</Text>
            <Text style={s.logMeta}>
              {log.actor?.username || "system"} · {formatLogDate(log.timestamp)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[s.container, s.loadingCenter]} edges={["top"]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={s.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <Text style={s.screenTitle}>Reports</Text>
        </View>

        {/* ── MANAGER/ADMIN VIEW ─────────────────────────────────────────── */}
        {isManagerOrAdmin && (
          <>
            {/* Revenue overview */}
            {revenueStats && (
              <>
                <Text style={s.sectionLabel}>OVERVIEW</Text>
                <View style={s.section}>
                  <View style={s.statsRow}>
                    <StatCard
                      value={`₱${(revenueStats.totalRevenue || 0).toLocaleString(
                        "en-PH",
                        { maximumFractionDigits: 0 }
                      )}`}
                      label="Total Revenue"
                      colorScheme="green"
                    />
                    <View style={{ width: Spacing.listGap }} />
                    <StatCard
                      value={`₱${(revenueStats.monthRevenue || 0).toLocaleString(
                        "en-PH",
                        { maximumFractionDigits: 0 }
                      )}`}
                      label="This Month"
                      colorScheme="blue"
                    />
                  </View>
                  <View style={{ height: Spacing.listGap }} />
                  <StatCard
                    value={`₱${(revenueStats.weekRevenue || 0).toLocaleString(
                      "en-PH",
                      { maximumFractionDigits: 0 }
                    )}`}
                    label="This Week"
                    colorScheme="neutral"
                    fullWidth
                  />
                  <View style={s.breakdownCard}>
                    <View style={s.breakdownItem}>
                      <Text
                        style={[
                          s.breakdownValue,
                          { color: theme.statusCompleted },
                        ]}
                      >
                        {revenueStats.completedCount}
                      </Text>
                      <Text style={s.breakdownLabel}>Completed</Text>
                    </View>
                    <View style={s.breakdownSep} />
                    <View style={s.breakdownItem}>
                      <Text
                        style={[
                          s.breakdownValue,
                          { color: theme.statusPending },
                        ]}
                      >
                        {revenueStats.pendingCount}
                      </Text>
                      <Text style={s.breakdownLabel}>Pending</Text>
                    </View>
                    <View style={s.breakdownSep} />
                    <View style={s.breakdownItem}>
                      <Text
                        style={[
                          s.breakdownValue,
                          { color: theme.statusCancelled },
                        ]}
                      >
                        {revenueStats.cancelledCount}
                      </Text>
                      <Text style={s.breakdownLabel}>Cancelled</Text>
                    </View>
                  </View>
                </View>
              </>
            )}

            {/* Sales trend chart */}
            {managerDailyData.length > 0 && (
              <>
                <Text style={s.sectionLabel}>SALES TREND</Text>
                <View style={s.chartCard}>
                  <View style={s.chartHeader}>
                    <Text style={s.chartTitle}>Last 7 Days</Text>
                    <View style={s.chartToggleRow}>
                      {[
                        { key: "revenue", label: "Revenue" },
                        { key: "count", label: "Count" },
                      ].map(({ key, label }) => {
                        const active = chartMode === key;
                        return (
                          <TouchableOpacity
                            key={key}
                            onPress={() => setChartMode(key)}
                            style={[
                              s.chartToggle,
                              {
                                backgroundColor: active
                                  ? theme.primary
                                  : theme.surface,
                                borderColor: active
                                  ? theme.primary
                                  : theme.border,
                              },
                            ]}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                s.chartToggleText,
                                {
                                  color: active ? "#fff" : theme.textSecondary,
                                  fontFamily: active
                                    ? Font.semiBold
                                    : Font.regular,
                                },
                              ]}
                            >
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                  <BarChart
                    data={managerDailyData}
                    barColor={
                      chartMode === "revenue" ? theme.currency : theme.primary
                    }
                    primaryText={theme.textPrimary}
                    secondaryText={theme.textSecondary}
                    labelFn={
                      chartMode === "revenue"
                        ? (v) =>
                            v >= 1000
                              ? `${(v / 1000).toFixed(1)}K`
                              : String(Math.round(v))
                        : undefined
                    }
                  />
                  <Text
                    style={{
                      fontFamily: Font.regular,
                      fontSize: 10,
                      color: theme.textSecondary,
                      textAlign: "right",
                      marginTop: 2,
                    }}
                  >
                    {chartMode === "revenue"
                      ? "Revenue (₱) · all sellers"
                      : "Completed transactions · all sellers"}
                  </Text>
                </View>
              </>
            )}

            {/* Top products */}
            {revenueStats?.topProducts?.length > 0 && (
              <>
                <Text style={s.sectionLabel}>TOP SELLING PRODUCTS</Text>
                <View style={s.topCard}>
                  {revenueStats.topProducts.map((p, i) => (
                    <View key={i}>
                      {i > 0 && <View style={s.divider} />}
                      <View style={s.topRow}>
                        <Text style={s.topRank}>{i + 1}</Text>
                        <Text style={s.topName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={s.topQty}>{p.qty}</Text>
                        <Text style={s.topQtyLabel}> units</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Export */}
            <Text style={s.sectionLabel}>EXPORT</Text>
            <View style={s.exportCard}>
              <ExportButton
                icon="📄"
                label="Transactions Report (PDF)"
                exportKey="transactions"
                onPress={handleExportTransactions}
              />
              <View style={s.divider} />
              <ExportButton
                icon="📦"
                label="Inventory Report (PDF)"
                exportKey="inventory"
                onPress={handleExportInventory}
              />
              <View style={s.divider} />
              <ExportButton
                icon="⚠️"
                label="Low Stock Report (PDF)"
                exportKey="lowstock"
                onPress={handleExportLowStock}
              />
              {isAdmin && (
                <>
                  <View style={s.divider} />
                  <ExportButton
                    icon="🔍"
                    label="Audit Log (PDF)"
                    exportKey="audit"
                    onPress={handleExportAuditLog}
                  />
                </>
              )}
            </View>
          </>
        )}

        {/* ── STAFF VIEW ────────────────────────────────────────────────── */}
        {!isManagerOrAdmin && (
          <>
            {/* Summary stats */}
            <Text style={s.sectionLabel}>MY PERFORMANCE</Text>
            {perf ? (
              <View style={s.section}>
                <View style={s.statsRow}>
                  <StatCard
                    value={`₱${(perf.totalRevenue || 0).toLocaleString("en-PH", {
                      maximumFractionDigits: 0,
                    })}`}
                    label="Total Revenue"
                    colorScheme="green"
                  />
                  <View style={{ width: Spacing.listGap }} />
                  <StatCard
                    value={`₱${(perf.weekRevenue || 0).toLocaleString("en-PH", {
                      maximumFractionDigits: 0,
                    })}`}
                    label="This Week"
                    colorScheme="blue"
                  />
                </View>
                <View style={{ height: Spacing.listGap }} />
                <StatCard
                  value={perf.totalItems}
                  label="Total Items Sold"
                  colorScheme="neutral"
                  fullWidth
                />
                <View style={s.breakdownCard}>
                  <View style={s.breakdownItem}>
                    <Text
                      style={[
                        s.breakdownValue,
                        { color: theme.statusCompleted },
                      ]}
                    >
                      {perf.completedCount}
                    </Text>
                    <Text style={s.breakdownLabel}>Completed</Text>
                  </View>
                  <View style={s.breakdownSep} />
                  <View style={s.breakdownItem}>
                    <Text
                      style={[
                        s.breakdownValue,
                        { color: theme.statusPending },
                      ]}
                    >
                      {perf.pendingCount}
                    </Text>
                    <Text style={s.breakdownLabel}>Pending</Text>
                  </View>
                  <View style={s.breakdownSep} />
                  <View style={s.breakdownItem}>
                    <Text
                      style={[
                        s.breakdownValue,
                        { color: theme.statusCancelled },
                      ]}
                    >
                      {perf.cancelledCount}
                    </Text>
                    <Text style={s.breakdownLabel}>Cancelled</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text
                style={[
                  s.logEmpty,
                  {
                    marginHorizontal: Spacing.screenPadding,
                    marginBottom: Spacing.sectionGap,
                  },
                ]}
              >
                No transactions yet.
              </Text>
            )}

            {/* 7-day chart */}
            <View style={s.chartCard}>
              <View style={s.chartHeader}>
                <Text style={s.chartTitle}>Last 7 Days</Text>
                <View style={s.chartToggleRow}>
                  {[
                    { key: "revenue", label: "Revenue" },
                    { key: "count", label: "Count" },
                  ].map(({ key, label }) => {
                    const active = chartMode === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => setChartMode(key)}
                        style={[
                          s.chartToggle,
                          {
                            backgroundColor: active
                              ? theme.primary
                              : theme.surface,
                            borderColor: active ? theme.primary : theme.border,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            s.chartToggleText,
                            {
                              color: active ? "#fff" : theme.textSecondary,
                              fontFamily: active ? Font.semiBold : Font.regular,
                            },
                          ]}
                        >
                          {label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              <BarChart
                data={dailyData}
                barColor={chartMode === "revenue" ? theme.currency : theme.primary}
                primaryText={theme.textPrimary}
                secondaryText={theme.textSecondary}
                labelFn={
                  chartMode === "revenue"
                    ? (v) =>
                        v >= 1000
                          ? `${(v / 1000).toFixed(1)}K`
                          : String(Math.round(v))
                    : undefined
                }
              />
              <Text
                style={{
                  fontFamily: Font.regular,
                  fontSize: 10,
                  color: theme.textSecondary,
                  textAlign: "right",
                  marginTop: 2,
                }}
              >
                {chartMode === "revenue" ? "Revenue (₱)" : "Completed transactions"}
              </Text>
            </View>

            {/* Recent transactions */}
            {recentTxs.length > 0 && (
              <>
                <Text style={s.sectionLabel}>RECENT TRANSACTIONS</Text>
                <View style={s.card}>
                  {recentTxs.map((tx, i) => (
                    <View key={tx._id}>
                      {i > 0 && <View style={s.divider} />}
                      <TransactionItem transaction={tx} />
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        {/* ── AUDIT LOG (all roles) ──────────────────────────────────────── */}
        <Text
          style={[
            s.sectionLabel,
            { marginTop: Spacing.sm },
          ]}
        >
          {isManagerOrAdmin ? "AUDIT LOG" : "MY ACTIVITY"}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipRow}
          style={{ marginBottom: Spacing.sm }}
        >
          {LOG_GROUPS.map((g) => (
            <Chip
              key={g.key}
              label={g.label}
              active={logGroup === g.key}
              onPress={() => handleGroupChange(g.key)}
            />
          ))}
        </ScrollView>

        <View style={s.card}>
          {logLoading ? (
            <ActivityIndicator
              size="small"
              color={theme.primary}
              style={s.logSpinner}
            />
          ) : auditLogs.length === 0 ? (
            <Text style={s.logEmpty}>No logs found.</Text>
          ) : (
            auditLogs.map((log, i) => (
              <LogItem key={log._id} log={log} showDivider={i > 0} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
