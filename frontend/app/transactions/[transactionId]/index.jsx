import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../components/ThemeProvider";
import { useAuth } from "../../../context/AuthContext";
import Header from "../../../components/ui/Header";
import { Loading } from "../../../components/ui";
import Button from "../../../components/ui/Button";
import {
   TransactionInfoCard,
   TotalCard,
   ProductListCard,
   AddProductPanel,
   ActionButtons,
} from "../../../components/transaction";
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

const api_url =
   process.env.NODE_ENV === "development"
      ? process.env.EXPO_PUBLIC_API_DEVURL
      : process.env.EXPO_PUBLIC_API_URL;

export default function TransactionDetail() {
   const { theme } = useTheme();
   const { authState, user } = useAuth();
   const { transactionId } = useLocalSearchParams();

   const [transaction, setTransaction] = useState(null);
   const [loading, setLoading] = useState(true);
   const [allProducts, setAllProducts] = useState([]);
   const [editedProducts, setEditedProducts] = useState([]);
   const [showAddPanel, setShowAddPanel] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [saving, setSaving] = useState(false);

   const isPending = transaction?.status === "pending";
   const isOwner = transaction?.seller?.username === user?.username;
   const canEdit =
      isPending &&
      (isOwner || user?.role === "admin" || user?.role === "manager");

   const hasChanges =
      JSON.stringify(
         editedProducts.map((p) => ({ id: p.product?._id, q: p.quantity })),
      ) !==
      JSON.stringify(
         (transaction?.products || []).map((p) => ({
            id: p.product?._id,
            q: p.quantity,
         })),
      );

   useEffect(() => {
      fetchTransaction();
      fetchAllProducts();
   }, [transactionId]);

   const fetchTransaction = async () => {
      try {
         setLoading(true);
         const res = await axios.get(
            `${api_url}/sales/transaction/${transactionId}`,
            {
               headers: { Authorization: `Bearer ${authState.token}` },
            },
         );
         setTransaction(res.data);
         setEditedProducts(res.data.products);
      } catch {
         Alert.alert("Error", "Failed to fetch transaction details");
      } finally {
         setLoading(false);
      }
   };

   const fetchAllProducts = async () => {
      try {
         const res = await axios.get(`${api_url}/products`, {
            headers: { Authorization: `Bearer ${authState.token}` },
            params: { limit: 100 },
         });
         setAllProducts(res.data.products);
      } catch {}
   };

   const handleChangeQty = (index, qty) => {
      if (qty < 1) return handleRemove(index);
      setEditedProducts((prev) =>
         prev.map((p, i) => (i === index ? { ...p, quantity: qty } : p)),
      );
   };

   const handleRemove = (index) => {
      setEditedProducts((prev) => prev.filter((_, i) => i !== index));
   };

   const handleAddProduct = (product) => {
      const existing = editedProducts.findIndex(
         (p) => p.product?._id === product._id,
      );
      if (existing >= 0) {
         setEditedProducts((prev) =>
            prev.map((p, i) =>
               i === existing ? { ...p, quantity: p.quantity + 1 } : p,
            ),
         );
      } else {
         setEditedProducts((prev) => [...prev, { product, quantity: 1 }]);
      }
      setShowAddPanel(false);
      setSearchQuery("");
   };

   const handleSaveProducts = async () => {
      try {
         setSaving(true);
         await axios.post(
            `${api_url}/sales/transaction-update-products`,
            {
               transaction: { id: transactionId, seller: transaction.seller },
               products: editedProducts.map((p) => ({
                  product: p.product._id,
                  quantity: p.quantity,
               })),
            },
            { headers: { Authorization: `Bearer ${authState.token}` } },
         );
         await fetchTransaction();
         Alert.alert("Saved", "Transaction updated.");
      } catch (e) {
         Alert.alert("Error", e.response?.data?.message || "Failed to update");
      } finally {
         setSaving(false);
      }
   };

   const handleFinalize = () => {
      Alert.alert("Finalize Transaction", "This cannot be undone.", [
         { text: "Cancel", style: "cancel" },
         {
            text: "Finalize",
            onPress: async () => {
               try {
                  await axios.post(
                     `${api_url}/sales/transaction-finalize`,
                     {
                        transaction: {
                           id: transactionId,
                           seller: transaction.seller,
                        },
                     },
                     {
                        headers: { Authorization: `Bearer ${authState.token}` },
                     },
                  );
                  fetchTransaction();
               } catch (e) {
                  Alert.alert(
                     "Error",
                     e.response?.data?.message || "Failed to finalize",
                  );
               }
            },
         },
      ]);
   };

   const handleCancel = () => {
      Alert.alert("Cancel Transaction", "Are you sure?", [
         { text: "No", style: "cancel" },
         {
            text: "Yes, Cancel",
            style: "destructive",
            onPress: async () => {
               try {
                  await axios.post(
                     `${api_url}/sales/transaction-cancel`,
                     { transactionId },
                     {
                        headers: { Authorization: `Bearer ${authState.token}` },
                     },
                  );
                  fetchTransaction();
               } catch (e) {
                  Alert.alert(
                     "Error",
                     e.response?.data?.message || "Failed to cancel",
                  );
               }
            },
         },
      ]);
   };

   const total = editedProducts.reduce(
      (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
      0,
   );

   const styles = StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.background },
      content: {
         paddingHorizontal: 20,
         paddingVertical: 16,
         paddingBottom: 40,
         marginBottom: 80,
      },
      sectionTitle: {
         fontSize: 14,
         fontWeight: "600",
         color: theme.textSecondary,
         marginBottom: 8,
      },
      sectionHeader: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
         marginBottom: 8,
      },
      detailCard: {
         backgroundColor: theme.bg2,
         borderRadius: 12,
         padding: 16,
         marginBottom: 12,
      },
      row: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
         paddingVertical: 8,
         borderBottomWidth: 1,
         borderBottomColor: theme.border,
      },
      label: { fontSize: 13, color: theme.textSecondary },
      value: { fontSize: 14, fontWeight: "600", color: theme.textPrimary },
      productItem: {
         paddingVertical: 12,
         borderBottomWidth: 1,
         borderBottomColor: theme.border,
      },
      productName: {
         fontSize: 14,
         fontWeight: "500",
         color: theme.textPrimary,
         marginBottom: 4,
      },
      productMeta: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
         flexWrap: "wrap",
         gap: 8,
      },
      totalAmount: { fontSize: 18, fontWeight: "bold", color: theme.success },
      qtyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
      qtyBtn: {
         backgroundColor: theme.gray || "#686868",
         width: 26,
         height: 26,
         borderRadius: 13,
         alignItems: "center",
         justifyContent: "center",
      },
      qtyText: {
         minWidth: 24,
         textAlign: "center",
         color: theme.textPrimary,
         fontWeight: "600",
      },
      addBtn: {
         backgroundColor: theme.success,
         width: 32,
         height: 32,
         borderRadius: 16,
         alignItems: "center",
         justifyContent: "center",
      },
      actionRow: { flexDirection: "row", gap: 12, marginTop: 8, marginBottom: 12 },
   });

   return (
      <SafeAreaView style={styles.container}>
         <Header title="Transaction Details" showBack />
         <Loading isLoading={loading} message="Loading transaction...">
            <ScrollView style={styles.content}>
               {transaction && (
                  <>
                     <Text style={styles.sectionTitle}>TRANSACTION INFO</Text>
                     <TransactionInfoCard
                        transaction={transaction}
                        styles={styles}
                     />
                     <ActionButtons
                        status={transaction.status}
                        onFinalize={handleFinalize}
                        onCancel={handleCancel}
                        styles={styles}
                     />
                     <TotalCard total={total} styles={styles} />

                     <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>PRODUCTS</Text>
                        {canEdit && (
                           <TouchableOpacity
                              onPress={() => setShowAddPanel((v) => !v)}
                           >
                              <MaterialIcons
                                 name={showAddPanel ? "close" : "add-circle"}
                                 size={24}
                                 color={theme.success}
                              />
                           </TouchableOpacity>
                        )}
                     </View>

                     {showAddPanel && canEdit && (
                        <View style={styles.detailCard}>
                           <AddProductPanel
                              allProducts={allProducts}
                              onAdd={handleAddProduct}
                              searchQuery={searchQuery}
                              setSearchQuery={setSearchQuery}
                              styles={styles}
                           />
                        </View>
                     )}

                     <ProductListCard
                        products={editedProducts}
                        editable={canEdit}
                        onChangeQty={handleChangeQty}
                        onRemove={handleRemove}
                        styles={styles}
                     />

                     {canEdit && hasChanges && (
                        <Button
                           title={saving ? "Saving..." : "Save Changes"}
                           variant="primary"
                           disabled={saving}
                           onPress={handleSaveProducts}
                           style={{ marginBottom: 30 }}
                        />
                     )}
                  </>
               )}
            </ScrollView>
         </Loading>
      </SafeAreaView>
   );
}