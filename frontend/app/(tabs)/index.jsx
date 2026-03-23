import {
   View,
   ScrollView,
   Alert,
   StyleSheet,
   RefreshControl,
} from "react-native";
import { Caption, Subtitle, Body } from "../../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { router } from "expo-router";
import HomeHeader from "../../components/home/HomeHeader";
import StatCard from "../../components/home/StatCard";
import QuickActionCard from "../../components/home/QuickActionCard";
import { getQuickActions } from "../../utils/quickActions";
import Card from "../../components/ui/Card";
import { useEffect, useState } from "react";
import axios from "axios";

const api_url =
   process.env.NODE_ENV === "development"
      ? process.env.EXPO_PUBLIC_API_DEVURL
      : process.env.EXPO_PUBLIC_API_URL;

export default function HomeScreen() {
   const { theme, toggleTheme } = useTheme();
   const { user, logout, authState } = useAuth();
   const [totalItems, setTotalItems] = useState(0);
   const [totalStocks, setTotalStocks] = useState(0);
   const [todaysSales, setTodaysSales] = useState(0);
   const [loadingStats, setLoadingStats] = useState(true);
   const [refreshing, setRefreshing] = useState(false);

   useEffect(() => {
      fetchStats();
   }, []);

   const fetchStats = async () => {
      try {
         setLoadingStats(true);
         const response = await axios.get(`${api_url}/sales/stats`, {
            headers: {
               Authorization: `Bearer ${authState.token}`,
            },
         });
         setTotalItems(response.data.totalItemsSold);
         setTotalStocks(response.data.totalStocks);
         setTodaysSales(response.data.todaysSales);
      } catch (error) {
         console.error("Error fetching stats:", error);
      } finally {
         setLoadingStats(false);
      }
   };

   const onRefresh = async () => {
      setRefreshing(true);
      await fetchStats();
      setRefreshing(false);
   };

   const quickActions = getQuickActions(user?.role?.toLowerCase());

   const handleLogout = async () => {
      await logout();
      router.replace("/(auth)/login");
   };

   const handleActionPress = (action) => {
      if (action.route) {
         router.push(action.route);
      } else if (action.action === "quickCheck") {
         Alert.alert("Quick Check", "Scan or search for items");
      } else if (action.action === "settings") {
         Alert.alert("Coming Soon", "Admin settings in development");
      }
   };

   const styles = StyleSheet.create({
      container: {
         flex: 1,
         backgroundColor: theme.background,
      },
      scrollContent: {
         padding: 20,
      },
      statsContainer: {
         flexDirection: "row",
         gap: 12,
         marginBottom: 24,
      },
      menuGrid: {
         gap: 16,
         paddingBottom: 40,
      },
      emptyState: {
         flex: 1,
         justifyContent: "center",
         alignItems: "center",
         paddingVertical: 60,
      },
   });

   return (
      <SafeAreaView style={styles.container}>
         <HomeHeader
            username={user?.username || "User"}
            role={user?.role || "Staff"}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
         />

         <ScrollView
            style={styles.scrollContent}
            refreshControl={
               <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.primary}
               />
            }
         >
            {(user?.role?.toLowerCase() === "manager" ||
               user?.role?.toLowerCase() === "admin") &&
               (loadingStats ? (
                  <Card
                     style={{
                        padding: 20,
                        backgroundColor: theme.secondary,
                        marginBottom: 24,
                     }}
                  >
                     <Body style={{ textAlign: "center" }}>
                        Loading stats...
                     </Body>
                  </Card>
               ) : (
                  <View style={styles.statsContainer}>
                     <StatCard
                        value={totalItems}
                        backgroundColor={theme.bg2}
                        label="Total Items"
                     />
                     <StatCard
                        value={totalStocks}
                        label={
                           totalStocks < 50 ? "Low Stock" : "Total Stock Value"
                        }
                        backgroundColor={theme.card}
                     />
                     <StatCard
                        value={`₱${todaysSales?.toLocaleString() || 0}`}
                        label="Today's Sales"
                        backgroundColor={theme.success}
                     />
                  </View>
               ))}

            <Card
               style={{
                  marginBottom: 24,
                  opacity: 0.9,
                  backgroundColor: theme.border,
               }}
            >
               <Caption align="center">
                  💡 Use the tabs below to navigate between Inventory, Sales,
                  and Reports
               </Caption>
            </Card>

            <Subtitle style={{ marginBottom: 16 }}>Quick Actions</Subtitle>

            <View style={styles.menuGrid}>
               {quickActions.length > 0 ? (
                  quickActions.map((action, index) => (
                     <QuickActionCard
                        key={index}
                        icon={action.icon}
                        title={action.title}
                        description={action.description}
                        onPress={() => handleActionPress(action)}
                     />
                  ))
               ) : (
                  <View style={styles.emptyState}>
                     <Body align="center">
                        No actions available for your role.{"\n"}Please contact
                        your administrator.
                     </Body>
                  </View>
               )}
            </View>
         </ScrollView>
      </SafeAreaView>
   );
}
