import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { Loading } from "../../components/ui";
import StatCard from "../../components/home/StatCard";
import TransactionItem from "../../components/TransactionItem";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

const DATE_FILTERS = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
];

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function SalesScreen() {
  const { theme } = useTheme();
  const { authState } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalItemsSold: 0,
    totalStocks: 0,
    todaysSales: 0,
  });
  const [dateFilter, setDateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sellerQuery, setSellerQuery] = useState("");

  const isManagerOrAdmin =
    authState.user?.role === "manager" || authState.user?.role === "admin";

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${authState.token}` };
      const [txRes, statsRes] = await Promise.all([
        axios.get(`${api_url}/sales/transactions`, { headers }),
        axios.get(`${api_url}/sales/stats`, { headers }),
      ]);
      setTransactions(txRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching sales data:", error);
      Alert.alert("Error", "Failed to fetch sales data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return transactions.filter((tx) => {
      if (dateFilter === "today") {
        if (new Date(tx.createdAt) < startOfDay) return false;
      } else if (dateFilter === "week") {
        if (new Date(tx.createdAt) < startOfWeek) return false;
      }

      if (statusFilter !== "all" && tx.status !== statusFilter) return false;

      if (sellerQuery.trim()) {
        const username = tx.seller?.username?.toLowerCase() || "";
        if (!username.includes(sellerQuery.trim().toLowerCase())) return false;
      }

      return true;
    });
  }, [transactions, dateFilter, statusFilter, sellerQuery]);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
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
    statsSection: {
      paddingHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sectionGap,
    },
    statsRow: { flexDirection: "row" },
    filterSection: {
      paddingHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    chipRow: {
      flexDirection: "row",
      gap: Spacing.xs,
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
    sellerInput: {
      height: 34,
      borderWidth: 1,
      borderRadius: Radius.input,
      paddingHorizontal: Spacing.md,
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
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
    listWrapper: {
      flex: 1,
      marginHorizontal: Spacing.screenPadding,
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },
    empty: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      textAlign: "center",
      paddingVertical: Spacing.xl,
    },
    listContent: { paddingBottom: 16 },
  });

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
      <Text style={[s.chipText, { color: active ? "#ffffff" : theme.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.screenTitle}>Sales</Text>
      </View>

      <View style={s.statsSection}>
        <View style={s.statsRow}>
          <StatCard
            value={stats.totalItemsSold}
            label="Items Sold"
            colorScheme="blue"
          />
          <View style={{ width: Spacing.listGap }} />
          <StatCard
            value={filteredTransactions.length}
            label="Transactions"
            colorScheme="neutral"
          />
        </View>
        <View style={{ height: Spacing.listGap }} />
        <StatCard
          value={`₱${stats.todaysSales?.toLocaleString() || 0}`}
          label="Today's Sales"
          colorScheme="green"
          fullWidth
        />
      </View>

      <View style={s.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipRow}
        >
          {DATE_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={dateFilter === f.key}
              onPress={() => setDateFilter(f.key)}
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.chipRow}
        >
          {STATUS_FILTERS.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              active={statusFilter === f.key}
              onPress={() => setStatusFilter(f.key)}
            />
          ))}
        </ScrollView>

        {isManagerOrAdmin && (
          <TextInput
            style={[
              s.sellerInput,
              {
                borderColor: theme.border,
                color: theme.textPrimary,
                backgroundColor: theme.surface,
              },
            ]}
            placeholder="Filter by seller..."
            placeholderTextColor={theme.textSecondary}
            value={sellerQuery}
            onChangeText={setSellerQuery}
          />
        )}
      </View>

      <Text style={s.sectionLabel}>TRANSACTIONS</Text>

      <Loading isLoading={loading} message="Loading transactions...">
        <View style={s.listWrapper}>
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.primary}
              />
            }
            contentContainerStyle={s.listContent}
            renderItem={({ item }) => <TransactionItem transaction={item} />}
            ItemSeparatorComponent={() => <View style={s.divider} />}
            ListEmptyComponent={
              <Text style={s.empty}>
                No transactions found.
              </Text>
            }
          />
        </View>
      </Loading>
    </SafeAreaView>
  );
}
