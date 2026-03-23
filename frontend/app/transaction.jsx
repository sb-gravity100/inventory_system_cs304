import { View, ScrollView, Alert, TouchableOpacity } from "react-native";
import { Body, Caption, Loading } from "../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/ui/Header";
import SearchBar from "../components/ui/SearchBar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { router } from "expo-router";

const api_url =
   process.env.NODE_ENV === "development"
      ? process.env.EXPO_PUBLIC_API_DEVURL
      : process.env.EXPO_PUBLIC_API_URL;

export default function TransactionScreen() {
   const { theme } = useTheme();
   const { authState } = useAuth();
   const [products, setProducts] = useState([]);
   const [selectedProducts, setSelectedProducts] = useState([]);
   const [searchQuery, setSearchQuery] = useState("");
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      fetchProducts();
   }, []);

   const fetchProducts = async () => {
      try {
         const response = await axios.get(`${api_url}/products`, {
            headers: { Authorization: `Bearer ${authState.token}` },
            params: { name: searchQuery, limit: 100 },
         });
         setProducts(response.data.products);
         setLoading(false);
      } catch (error) {
         Alert.alert("Error", "Failed to fetch products");
      }
   };

   const addProduct = (product) => {
      const existing = selectedProducts.find(
         (p) => p.product._id === product._id,
      );
      if (existing) {
         setSelectedProducts(
            selectedProducts.map((p) =>
               p.product._id === product._id
                  ? { ...p, quantity: Math.min(p.quantity + 1, product.stock) }
                  : p,
            ),
         );
      } else {
         setSelectedProducts([...selectedProducts, { product, quantity: 1 }]);
      }
   };

   const updateQuantity = (productId, quantity) => {
      if (quantity <= 0) {
         setSelectedProducts(
            selectedProducts.filter((p) => p.product._id !== productId),
         );
      } else {
         setSelectedProducts(
            selectedProducts.map((p) =>
               p.product._id === productId ? { ...p, quantity } : p,
            ),
         );
      }
   };

   const createTransaction = async () => {
      if (selectedProducts.length === 0) {
         Alert.alert("Error", "Add at least one product");
         return;
      }

      try {
         const productsData = selectedProducts.map((p) => ({
            product: p.product._id,
            quantity: p.quantity,
         }));

         await axios.post(
            `${api_url}/sales/transaction`,
            { products: productsData },
            { headers: { Authorization: `Bearer ${authState.token}` } },
         );

         Alert.alert("Success", "Transaction created");
         router.push("/sales");
         setSelectedProducts([]);
      } catch (error) {
         Alert.alert(
            "Error",
            error.response?.data?.message || "Failed to create transaction",
         );
      }
   };

   const total = selectedProducts.reduce(
      (sum, p) => sum + p.product.price * p.quantity,
      0,
   );

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
         <Header title="💰 New Transaction" showBack />

         <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            style={{ margin: 20 }}
         />

         <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
               <Caption style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                  Available Products
               </Caption>
               <View style={{ paddingHorizontal: 20 }}>
                  <Loading isLoading={loading} message="Loading products...">
                     {products.map((product) => (
                        <Card
                           key={product._id}
                           style={{
                              marginBottom: 12,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                           }}
                        >
                           <View style={{ flex: 1 }}>
                              <Body style={{ fontWeight: "600" }}>
                                 {product.name}
                              </Body>
                              <Caption>
                                 ₱{product.price} • Stock: {product.stock}
                              </Caption>
                           </View>
                           <Button
                              title="Add"
                              variant="success"
                              onPress={() => addProduct(product)}
                              style={{
                                 paddingHorizontal: 16,
                                 paddingVertical: 8,
                              }}
                           />
                        </Card>
                     ))}
                  </Loading>
               </View>
            </ScrollView>

            {selectedProducts.length > 0 && (
               <View
                  style={{
                     borderTopWidth: 1,
                     borderTopColor: theme.border,
                     paddingTop: 16,
                  }}
               >
                  <Caption style={{ paddingHorizontal: 20, marginBottom: 12 }}>
                     Selected Items
                  </Caption>
                  <ScrollView style={{ paddingHorizontal: 20, maxHeight: 200 }}>
                     {selectedProducts.map((item) => (
                        <Card
                           key={item.product._id}
                           style={{
                              marginBottom: 12,
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                           }}
                        >
                           <View style={{ flex: 1 }}>
                              <Body style={{ fontWeight: "600" }}>
                                 {item.product.name}
                              </Body>
                              <Caption>₱{item.product.price}</Caption>
                           </View>
                           <View
                              style={{
                                 flexDirection: "row",
                                 alignItems: "center",
                                 gap: 12,
                              }}
                           >
                              <TouchableOpacity
                                 style={{
                                    backgroundColor: theme.gray,
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                                 onPress={() =>
                                    updateQuantity(
                                       item.product._id,
                                       item.quantity - 1,
                                    )
                                 }
                              >
                                 <MaterialIcons
                                    name="remove"
                                    size={20}
                                    color="#FFFFFF"
                                 />
                              </TouchableOpacity>
                              <Body
                                 style={{
                                    minWidth: 30,
                                    textAlign: "center",
                                    fontWeight: "600",
                                 }}
                              >
                                 {item.quantity}
                              </Body>
                              <TouchableOpacity
                                 style={{
                                    backgroundColor: theme.gray,
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    alignItems: "center",
                                    justifyContent: "center",
                                 }}
                                 onPress={() =>
                                    updateQuantity(
                                       item.product._id,
                                       Math.min(
                                          item.quantity + 1,
                                          item.product.stock,
                                       ),
                                    )
                                 }
                              >
                                 <MaterialIcons
                                    name="add"
                                    size={20}
                                    color="#FFFFFF"
                                 />
                              </TouchableOpacity>
                           </View>
                        </Card>
                     ))}
                  </ScrollView>
               </View>
            )}
         </View>

         <View
            style={{
               borderTopWidth: 1,
               borderTopColor: theme.border,
               padding: 20,
               backgroundColor: theme.background,
            }}
         >
            <View
               style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
               }}
            >
               <Body style={{ fontWeight: "600" }}>Total:</Body>
               <Body
                  style={{
                     fontSize: 24,
                     fontWeight: "bold",
                     color: theme.success,
                  }}
               >
                  ₱{total.toFixed(2)}
               </Body>
            </View>
            <Button
               title="Create Transaction"
               variant="primary"
               onPress={createTransaction}
               style={{ width: "100%" }}
            />
         </View>
      </SafeAreaView>
   );
}
