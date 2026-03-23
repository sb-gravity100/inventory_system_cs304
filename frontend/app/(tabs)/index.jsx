import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import StatCard from "../../components/home/StatCard";
import FAB from "../../components/ui/FAB";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

const STATUS_COLOR = (theme) => ({
  completed: theme.statusCompleted,
  pending: theme.statusPending,
  cancelled: theme.statusCancelled,
});

function RecentRow({ transaction, theme }) {
  const total = transaction.products.reduce(
    (sum, p) => sum + (p.product?.price || 0) * (p.quantity || 0),
    0
  );
  const statusColor = STATUS_COLOR(theme)[transaction.status] || theme.textSecondary;

  return (
    <TouchableOpacity
      style={styles(theme).recentRow}
      onPress={() => router.push(`/transactions/${transaction._id}`)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles(theme).recentSeller}>
          {transaction.seller?.username || "Unknown"}
        </Text>
        <Text style={[styles(theme).recentStatus, { color: statusColor }]}>
          {transaction.status}
        </Text>
      </View>
      <Text style={styles(theme).recentAmount}>₱{total.toFixed(2)}</Text>
      <MaterialIcons
        name="chevron-right"
        size={20}
        color={theme.textSecondary}
        style={{ marginLeft: 4 }}
      />
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, authState } = useAuth();
  const [totalItems, setTotalItems] = useState(0);
  const [totalStocks, setTotalStocks] = useState(0);
  const [todaysSales, setTodaysSales] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const isManagerOrAdmin =
    user?.role?.toLowerCase() === "manager" ||
    user?.role?.toLowerCase() === "admin";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${authState.token}` };
      const [statsRes, txRes] = await Promise.all([
        axios.get(`${api_url}/sales/stats`, { headers }),
        axios.get(`${api_url}/sales/transactions`, { headers }),
      ]);
      setTotalItems(statsRes.data.totalItemsSold);
      setTotalStocks(statsRes.data.totalStocks);
      setTodaysSales(statsRes.data.todaysSales);
      setRecentTransactions((txRes.data || []).slice(0, 5));
    } catch (error) {
      console.error("Error fetching home data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const getFabActions = () => {
    const role = user?.role?.toLowerCase();
    const actions = [
      {
        label: "New Transaction",
        icon: "add-shopping-cart",
        onPress: () => router.push("/transaction"),
      },
    ];
    if (role === "manager" || role === "admin") {
      actions.push({
        label: "Add Product",
        icon: "add-box",
        onPress: () => router.navigate("/(tabs)/inventory"),
      });
    }
    if (role === "admin") {
      actions.push({
        label: "Manage Users",
        icon: "manage-accounts",
        onPress: () => router.push("/users"),
      });
    }
    return actions;
  };

  const s = styles(theme);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header row in body */}
        <View style={s.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.screenTitle}>
              Welcome, {user?.username || "User"}
            </Text>
            <Text style={s.screenSubtitle}>
              {user?.role || "Staff"} Dashboard
            </Text>
          </View>
          <TouchableOpacity style={s.iconBtn} onPress={toggleTheme}>
            <MaterialIcons
              name={theme.isDark ? "light-mode" : "dark-mode"}
              size={22}
              color={theme.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={s.iconBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color={theme.danger} />
          </TouchableOpacity>
        </View>

        {/* Stat cards — 2+1 stacked layout (manager/admin only) */}
        {isManagerOrAdmin && (
          <View style={s.statsSection}>
            <View style={s.statsRow}>
              <StatCard
                value={totalItems}
                label="Items Sold"
                colorScheme="blue"
              />
              <View style={{ width: Spacing.listGap }} />
              <StatCard
                value={totalStocks}
                label="Total Stock"
                colorScheme="neutral"
              />
            </View>
            <View style={{ height: Spacing.listGap }} />
            <StatCard
              value={`₱${todaysSales?.toLocaleString() || 0}`}
              label="Today's Sales"
              colorScheme="green"
              fullWidth
            />
          </View>
        )}

        {/* Recent Transactions section */}
        <Text style={s.sectionLabel}>RECENT TRANSACTIONS</Text>
        {recentTransactions.length === 0 ? (
          <Text style={s.emptyText}>No transactions yet.</Text>
        ) : (
          <View style={s.recentList}>
            {recentTransactions.map((tx, i) => (
              <View key={tx._id}>
                {i > 0 && <View style={s.divider} />}
                <RecentRow transaction={tx} theme={theme} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <FAB actions={getFabActions()} />
    </SafeAreaView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: Spacing.screenPadding,
      paddingBottom: 100,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
      marginBottom: Spacing.sectionGap,
    },
    screenTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
    },
    screenSubtitle: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginTop: 2,
    },
    iconBtn: {
      padding: Spacing.sm,
    },
    statsSection: {
      marginBottom: Spacing.sectionGap,
    },
    statsRow: {
      flexDirection: "row",
    },
    sectionLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.sectionLabel,
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: Spacing.sm,
    },
    recentList: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: "hidden",
    },
    recentRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    recentSeller: {
      fontFamily: Font.medium,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
    },
    recentStatus: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      marginTop: 2,
    },
    recentAmount: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.currency,
      marginRight: 4,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },
    emptyText: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      textAlign: "center",
      paddingVertical: Spacing.xl,
    },
  });
