import {
  View,
  Text,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { FAB, SearchBar, Loading } from "../../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { useState, useCallback } from "react";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import ProductCard from "../../components/ProductCard";
import UpdateStockModal from "../../components/UpdateStockModal";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

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

  const [updateStockModal, setUpdateStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [stockAction, setStockAction] = useState("add");
  const [stockQuantity, setStockQuantity] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProducts(1);
    }, [])
  );

  const fetchProducts = async (pageNum, name = "") => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const response = await axios.get(`${api_url}/products`, {
        headers: { Authorization: `Bearer ${authState.token}` },
        params: { page: pageNum, limit: 20, name },
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
    const actions = [
      {
        label: "Create Transaction",
        icon: "add-shopping-cart",
        onPress: () => router.push("/transaction"),
      },
    ];
    if (role === "manager" || role === "admin") {
      actions.push({
        label: "Add Product",
        icon: "add-box",
        onPress: () => router.push("/add-product"),
      });
    }
    return actions;
  };

  const handleUpdateStock = () => {
    if (!selectedProduct || !stockQuantity) {
      Alert.alert("Error", "Please select product and enter quantity");
      return;
    }
    const endpoint =
      stockAction === "add" ? "increase-stock" : "update-stocks";
    axios
      .post(
        `${api_url}/products/${selectedProduct._id}/${endpoint}`,
        { quantity: parseInt(stockQuantity) },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      )
      .then(() => fetchProducts(1))
      .catch(() => Alert.alert("Error", "Failed to update stock"));
    setUpdateStockModal(false);
    setSelectedProduct(null);
    setStockQuantity("");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(1, searchQuery);
    setRefreshing(false);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingHorizontal: Spacing.screenPadding,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.xs,
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
    gridContent: {
      padding: Spacing.screenPadding,
      gap: Spacing.listGap,
      paddingBottom: 100,
    },
    columnWrapper: {
      gap: Spacing.listGap,
    },
    empty: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      textAlign: "center",
      paddingVertical: Spacing.xl,
    },
    footer: {
      paddingVertical: 20,
      alignItems: "center",
    },
  });

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.screenTitle}>Inventory</Text>
        <Text style={s.screenSubtitle}>{totalProducts} products</Text>
      </View>

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
        style={{ marginHorizontal: Spacing.screenPadding, marginVertical: Spacing.sm }}
      />

      <Loading isLoading={loading} message="Loading products...">
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={s.columnWrapper}
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
          contentContainerStyle={s.gridContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={s.empty}>
              No products found.{"\n"}Add your first product to get started.
            </Text>
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={s.footer}>
                <ActivityIndicator size="small" color={theme.primary} />
              </View>
            ) : null
          }
        />
      </Loading>

      <FAB actions={getActions()} />

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
