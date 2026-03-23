import {
   View,
   Alert,
   FlatList,
   ActivityIndicator,
   RefreshControl,
} from "react-native";
import { Caption, Header, FAB, SearchBar, Loading } from "../../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { router } from "expo-router";
import ProductCard from "../../components/ProductCard";
import AddProductModal from "../../components/AddProductModal";
import UpdateStockModal from "../../components/UpdateStockModal";

const api_url =
   process.env.NODE_ENV === "development"
      ? process.env.EXPO_PUBLIC_API_DEVURL
      : process.env.EXPO_PUBLIC_API_URL;

export default function InventoryScreen() {
   const { theme } = useTheme();
   const { authState, user } = useAuth();
   const [products, setProducts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   const [loadingMore, setLoadingMore] = useState(false);
   const [totalProducts, setTotalProducts] = useState(0);
   const [searchQuery, setSearchQuery] = useState("");

   const [addProductModal, setAddProductModal] = useState(false);
   const [updateStockModal, setUpdateStockModal] = useState(false);
   const [selectedProduct, setSelectedProduct] = useState(null);

   // Add Product form
   const [newProductName, setNewProductName] = useState("");
   const [newProductPrice, setNewProductPrice] = useState("");
   const [newProductStock, setNewProductStock] = useState("");

   // Update Stock form
   const [stockAction, setStockAction] = useState("add");
   const [stockQuantity, setStockQuantity] = useState("");
   const [refreshing, setRefreshing] = useState(false);

   useEffect(() => {
      fetchProducts(1);
   }, []);

   const fetchProducts = async (pageNum, name = "") => {
      try {
         if (pageNum === 1) {
            setLoading(true);
         } else {
            setLoadingMore(true);
         }

         const response = await axios.get(`${api_url}/products`, {
            headers: { Authorization: `Bearer ${authState.token}` },
            params: {
               page: pageNum,
               limit: 10,
               name,
            },
         });

         if (pageNum === 1) {
            setProducts(response.data.products);
            setTotalProducts(response.data.total);
         } else {
            setProducts((prev) => [...prev, ...response.data.products]);
         }

         setHasMore(response.data.hasNext);
         setPage(pageNum);
      } catch (error) {
         Alert.alert("Error", "Failed to fetch products");
      } finally {
         setLoading(false);
         setLoadingMore(false);
      }
   };

   const handleLoadMore = () => {
      if (!loadingMore && hasMore) {
         fetchProducts(page + 1, searchQuery);
      }
   };

   const handleUpdateStockFromCard = (product) => {
      setSelectedProduct(product);
      setUpdateStockModal(true);
   };

   const getActions = () => {
      const role = user?.role?.toLowerCase();
      const actions = [];

      // Staff action
      actions.push({
         label: "Create Transaction",
         icon: "add-shopping-cart",
         onPress: () => {
            router.push("/transaction");
         },
      });

      // Manager actions
      if (role === "manager" || role === "admin") {
         actions.push({
            label: "Add Product",
            icon: "add-box",
            onPress: () => {
               setAddProductModal(true);
            },
         });
      }

      return actions;
   };

   const handleAddProduct = () => {
      if (!newProductName || !newProductPrice || !newProductStock) {
         Alert.alert("Error", "Please fill all fields");
         return;
      }
      console.log(stockQuantity);
      axios
         .post(
            `${api_url}/products`,
            {
               name: newProductName,
               price: parseFloat(newProductPrice),
               stock: parseInt(newProductStock),
            },
            {
               headers: { Authorization: `Bearer ${authState.token}` },
            },
         )
         .then(() => {
            fetchProducts(1);
            Alert.alert("Success", "Product added successfully");
         })
         .catch((error) => {
            // Alert.alert("Error", "Failed to add product");
         });

      setAddProductModal(false);
      setNewProductName("");
      setNewProductPrice("");
      setNewProductStock("");
   };

   const handleUpdateStock = () => {
      if (!selectedProduct || !stockQuantity) {
         Alert.alert("Error", "Please select product and enter quantity");
         return;
      }

      // post to "/:id/update-stocks" or "/:id/increase-stock"
      const endpoint =
         stockAction === "add" ? "increase-stock" : "update-stocks";
      axios
         .post(
            `${api_url}/products/${selectedProduct._id}/${endpoint}`,
            {
               quantity: parseInt(stockQuantity),
            },
            {
               headers: { Authorization: `Bearer ${authState.token}` },
            },
         )
         .then(() => {
            fetchProducts(1);
         })
         .catch((error) => {
            Alert.alert("Error", "Failed to update stock");
         });
      setUpdateStockModal(false);
      setSelectedProduct(null);
      setStockQuantity("");
   };

   const onRefresh = async () => {
      setRefreshing(true);
      await fetchProducts(1, searchQuery);
      setRefreshing(false);
   };

   return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
         <Header
            title="📦 Inventory"
            subtitle={`${totalProducts} products in stock`}
         />

         <SearchBar
            onChangeText={(text) => {
               setSearchQuery(text);
               if (text === "") {
                  setProducts([]);
                  setHasMore(true);
               }
               fetchProducts(1, text);
            }}
            placeholder="Search products..."
            style={{
               margin: 20,
            }}
         />

         <Loading isLoading={loading} message="Loading products...">
            <FlatList
               data={products}
               keyExtractor={(item) => item._id}
               onScrollBeginDrag={() => {}}
               scrollEventThrottle={16}
               refreshControl={
                  <RefreshControl
                     refreshing={refreshing}
                     onRefresh={onRefresh}
                     tintColor={theme.primary}
                  />
               }
               renderItem={({ item }) => (
                  <ProductCard
                     product={item}
                     theme={theme}
                     onUpdateStock={handleUpdateStockFromCard}
                  />
               )}
               contentContainerStyle={{ padding: 20 }}
               onEndReached={handleLoadMore}
               onEndReachedThreshold={0.5}
               ListEmptyComponent={
                  <View
                     style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingVertical: 60,
                     }}
                  >
                     <Caption style={{ textAlign: "center" }}>
                        No products found.{"\n"}Add your first product to get
                        started.
                     </Caption>
                  </View>
               }
               ListFooterComponent={
                  loadingMore && (
                     <View
                        style={{ paddingVertical: 20, alignItems: "center" }}
                     >
                        <ActivityIndicator size="small" color={theme.primary} />
                     </View>
                  )
               }
            />
         </Loading>

         <FAB actions={getActions()} />

         <AddProductModal
            visible={addProductModal}
            newProductName={newProductName}
            setNewProductName={setNewProductName}
            newProductPrice={newProductPrice}
            setNewProductPrice={setNewProductPrice}
            newProductStock={newProductStock}
            setNewProductStock={setNewProductStock}
            onCancel={() => {
               setAddProductModal(false);
               setNewProductName("");
               setNewProductPrice("");
               setNewProductStock("");
            }}
            onSave={handleAddProduct}
         />

         <UpdateStockModal
            visible={updateStockModal}
            selectedProduct={selectedProduct}
            stockAction={stockAction}
            setStockAction={setStockAction}
            stockQuantity={stockQuantity}
            setStockQuantity={setStockQuantity}
            onCancel={() => {
               setUpdateStockModal(false);
               setSelectedProduct(null);
               setStockQuantity("");
               setStockAction("add");
            }}
            onSave={handleUpdateStock}
         />
      </SafeAreaView>
   );
}
