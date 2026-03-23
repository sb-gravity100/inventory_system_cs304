import {
   View,
   Text,
   StyleSheet,
   FlatList,
   RefreshControl,
   Alert,
   ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import Header from "../../components/ui/Header";
import { Caption, Subtitle, Body, Loading } from "../../components/ui";
import Card from "../../components/ui/Card";
import StatCard from "../../components/home/StatCard";
import TransactionItem from "../../components/TransactionItem";
import { useEffect, useState } from "react";
import axios from "axios";

const api_url =
   process.env.NODE_ENV === "development"
      ? process.env.EXPO_PUBLIC_API_DEVURL
      : process.env.EXPO_PUBLIC_API_URL;

export default function SalesScreen() {
   const { theme } = useTheme();
   const { authState, user } = useAuth();
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [stats, setStats] = useState({
      totalItemsSold: 0,
      totalStocks: 0,
      todaysSales: 0,
   });
   const [loadingStats, setLoadingStats] = useState(true);

   useEffect(() => {
      fetchTransactions();
      fetchStats();
   }, []);

   const fetchTransactions = async () => {
      try {
         setLoading(true);
         const response = await axios.get(`${api_url}/sales/transactions`, {
            headers: { Authorization: `Bearer ${authState.token}` },
         });
         setTransactions(response.data);
      } catch (error) {
         console.error("Error fetching transactions:", error);
         Alert.alert("Error", "Failed to fetch transactions");
      } finally {
         setLoading(false);
      }
   };

   const fetchStats = async () => {
      try {
         setLoadingStats(true);
         const response = await axios.get(`${api_url}/sales/stats`, {
            headers: { Authorization: `Bearer ${authState.token}` },
         });
         setStats(response.data);
      } catch (error) {
         console.error("Error fetching stats:", error);
      } finally {
         setLoadingStats(false);
      }
   };

   const onRefresh = async () => {
      setRefreshing(true);
      await Promise.all([fetchTransactions(), fetchStats()]);
      setRefreshing(false);
   };



   const styles = StyleSheet.create({
      container: {
         flex: 1,
         backgroundColor: theme.background,
      },
      statsContainer: {
         flexDirection: "row",
         gap: 12,
         paddingHorizontal: 20,
         paddingVertical: 16,
      },

      emptyState: {
         flex: 1,
         justifyContent: "center",
         alignItems: "center",
         paddingVertical: 60,
      },
      scrollContent: {
         paddingBottom: 40,
      },
   });



   return (
      <SafeAreaView style={styles.container}>
         <Header title="🛒 Sales" subtitle="Transaction Management" />

         {loadingStats ? (
            <Card
               style={{
                  marginHorizontal: 20,
                  marginVertical: 16,
                  padding: 20,
                  backgroundColor: theme.secondary,
               }}
            >
               <Body style={{ textAlign: "center" }}>Loading stats...</Body>
            </Card>
         ) : (
            <View style={styles.statsContainer}>
               <StatCard
                  value={stats.totalItemsSold}
                  label="Items Sold"
                  backgroundColor={theme.bg2}
               />
               <StatCard
                  value={transactions.length}
                  label="Transactions"
                  backgroundColor={theme.card}
               />
               <StatCard
                  value={`₱${stats.todaysSales?.toLocaleString() || 0}`}
                  label="Today's Sales"
                  backgroundColor={theme.success}
               />
            </View>
         )}

         <Loading isLoading={loading} message="Loading transactions...">
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
               renderItem={({ item }) => <TransactionItem transaction={item} />}
               contentContainerStyle={styles.scrollContent}
               ListEmptyComponent={
                  <View style={styles.emptyState}>
                     <Caption style={{ textAlign: "center" }}>
                        No transactions yet.{"\n"}Start creating sales
                        transactions to see them here.
                     </Caption>
                  </View>
               }
            />
         </Loading>
      </SafeAreaView>
   );
}
