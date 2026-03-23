import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { Loading } from "../../components/ui";
import StatCard from "../../components/home/StatCard";
import TransactionItem from "../../components/TransactionItem";
import { useEffect, useState } from "react";
import axios from "axios";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

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
            value={transactions.length}
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

      <Text style={s.sectionLabel}>TRANSACTIONS</Text>

      <Loading isLoading={loading} message="Loading transactions...">
        <View style={s.listWrapper}>
          <FlatList
            data={transactions}
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
                No transactions yet.{"\n"}Start creating sales transactions to
                see them here.
              </Text>
            }
          />
        </View>
      </Loading>
    </SafeAreaView>
  );
}
