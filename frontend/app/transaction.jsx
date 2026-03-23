import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Animated,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import SearchBar from "../components/ui/SearchBar";
import { Loading } from "../components/ui";
import { router } from "expo-router";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

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
  const [cartExpanded, setCartExpanded] = useState(false);

  const cartVisible = selectedProducts.length > 0;

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
    const existing = selectedProducts.find((p) => p.product._id === product._id);
    if (existing) {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.product._id === product._id
            ? { ...p, quantity: Math.min(p.quantity + 1, product.stock) }
            : p
        )
      );
    } else {
      setSelectedProducts([...selectedProducts, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setSelectedProducts(selectedProducts.filter((p) => p.product._id !== productId));
    } else {
      setSelectedProducts(
        selectedProducts.map((p) =>
          p.product._id === productId ? { ...p, quantity } : p
        )
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
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      Alert.alert("Success", "Transaction created");
      router.push("/sales");
      setSelectedProducts([]);
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to create transaction"
      );
    }
  };

  const total = selectedProducts.reduce(
    (sum, p) => sum + p.product.price * p.quantity,
    0
  );

  const itemCount = selectedProducts.reduce((sum, p) => sum + p.quantity, 0);

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.screenPadding,
      paddingVertical: Spacing.md,
      gap: Spacing.sm,
    },
    backBtn: { padding: 4 },
    headerTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
      flex: 1,
    },
    sectionLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.sectionLabel,
      color: theme.textSecondary,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      paddingHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.xs,
      marginTop: Spacing.sm,
    },
    // Product row (receipt style)
    productRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    productName: {
      fontFamily: Font.medium,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
      flex: 1,
    },
    productPrice: {
      fontFamily: Font.bold,
      fontSize: FontSize.listSecondary,
      color: theme.currency,
      marginRight: Spacing.md,
    },
    addBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.isDark ? "#1e3a5f" : "#dbeafe",
      alignItems: "center",
      justifyContent: "center",
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },
    // Cart bottom sheet
    cartSheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      borderTopWidth: 1,
      borderColor: theme.border,
      paddingBottom: 24,
    },
    cartHandle: {
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 6,
    },
    cartHandleBar: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
    },
    cartHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    cartTitle: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      flex: 1,
    },
    cartCount: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginRight: Spacing.md,
    },
    cartTotal: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.currency,
      marginRight: Spacing.md,
    },
    // Cart item row
    cartItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    cartItemName: {
      fontFamily: Font.medium,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      flex: 1,
    },
    qtyBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.isDark ? "#374151" : "#f3f4f6",
      alignItems: "center",
      justifyContent: "center",
    },
    qtyText: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      minWidth: 24,
      textAlign: "center",
    },
    confirmBtn: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.sm,
      backgroundColor: theme.primary,
      borderRadius: Radius.button,
      paddingVertical: 14,
      alignItems: "center",
    },
    confirmBtnText: {
      fontFamily: Font.bold,
      fontSize: FontSize.button,
      color: "#ffffff",
    },
    stockNote: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
  });

  const filteredProducts = searchQuery
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.headerRow}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>New Transaction</Text>
      </View>

      {/* Search */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search products..."
        style={{ marginHorizontal: Spacing.screenPadding, marginBottom: Spacing.sm }}
      />

      <Text style={s.sectionLabel}>PRODUCTS</Text>

      {/* Product list — receipt-style */}
      <Loading isLoading={loading} message="Loading products...">
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          style={{ flex: 1 }}
          renderItem={({ item, index }) => {
            const inCart = selectedProducts.find(
              (p) => p.product._id === item._id
            );
            return (
              <View>
                {index > 0 && <View style={s.divider} />}
                <View style={s.productRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.productName}>{item.name}</Text>
                    <Text style={s.stockNote}>Stock: {item.stock}</Text>
                  </View>
                  <Text style={s.productPrice}>₱{item.price.toFixed(2)}</Text>
                  <TouchableOpacity
                    style={s.addBtn}
                    onPress={() => addProduct(item)}
                    disabled={item.stock === 0}
                  >
                    <MaterialIcons
                      name="add"
                      size={20}
                      color={theme.isDark ? "#93c5fd" : "#1d4ed8"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                color: theme.textSecondary,
                padding: Spacing.xl,
                fontFamily: Font.regular,
                fontSize: FontSize.body,
              }}
            >
              No products found.
            </Text>
          }
        />
      </Loading>

      {/* Cart bottom sheet */}
      {cartVisible && (
        <View style={s.cartSheet}>
          {/* Drag handle — tap to expand/collapse */}
          <TouchableOpacity
            style={s.cartHandle}
            onPress={() => setCartExpanded((v) => !v)}
          >
            <View style={s.cartHandleBar} />
          </TouchableOpacity>

          {/* Collapsed header: count + total + confirm */}
          {!cartExpanded ? (
            <View style={s.cartHeaderRow}>
              <Text style={s.cartTitle}>Cart</Text>
              <Text style={s.cartCount}>{itemCount} item{itemCount !== 1 ? "s" : ""}</Text>
              <Text style={s.cartTotal}>₱{total.toFixed(2)}</Text>
              <TouchableOpacity style={s.confirmBtn} onPress={createTransaction}>
                <Text style={s.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Expanded: itemized list + confirm */
            <>
              <View style={s.cartHeaderRow}>
                <Text style={s.cartTitle}>Cart  ·  {itemCount} item{itemCount !== 1 ? "s" : ""}</Text>
                <Text style={s.cartTotal}>₱{total.toFixed(2)}</Text>
              </View>
              <ScrollView style={{ maxHeight: 220 }}>
                {selectedProducts.map((item, i) => (
                  <View key={item.product._id}>
                    {i > 0 && <View style={s.divider} />}
                    <View style={s.cartItem}>
                      <Text style={s.cartItemName} numberOfLines={1}>
                        {item.product.name}
                      </Text>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() =>
                          updateQuantity(item.product._id, item.quantity - 1)
                        }
                      >
                        <MaterialIcons
                          name="remove"
                          size={16}
                          color={theme.textPrimary}
                        />
                      </TouchableOpacity>
                      <Text style={s.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={s.qtyBtn}
                        onPress={() =>
                          updateQuantity(
                            item.product._id,
                            Math.min(item.quantity + 1, item.product.stock)
                          )
                        }
                      >
                        <MaterialIcons
                          name="add"
                          size={16}
                          color={theme.textPrimary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={s.confirmBtn} onPress={createTransaction}>
                <Text style={s.confirmBtnText}>Confirm Transaction</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
