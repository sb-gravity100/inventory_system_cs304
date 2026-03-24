import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../components/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import SearchBar from "../components/ui/SearchBar";
import { Loading } from "../components/ui";
import { router } from "expo-router";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

export default function POSScreen() {
  const { theme } = useTheme();
  const { authState } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [cartExpanded, setCartExpanded] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (name = "") => {
    try {
      setLoading(true);
      const response = await axios.get(`${api_url}/products`, {
        headers: { Authorization: `Bearer ${authState.token}` },
        params: { limit: 100, name },
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("[POS] fetchProducts error:", error.message);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock === 0) return;
    const existing = cart.find((c) => c.product._id === product._id);
    if (existing) {
      if (existing.quantity >= product.stock) return;
      setCart(
        cart.map((c) =>
          c.product._id === product._id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    console.debug("[POS] addToCart:", product.name);
  };

  const updateQty = (productId, delta) => {
    setCart((prev) => {
      const next = prev
        .map((c) =>
          c.product._id === productId
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0);
      return next;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((c) => c.product._id !== productId));
  };

  const total = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const cartQty = (productId) => {
    const entry = cart.find((c) => c.product._id === productId);
    return entry ? entry.quantity : 0;
  };

  const charge = async () => {
    if (cart.length === 0) return;
    try {
      setSubmitting(true);
      console.info("[POS] charge: submitting transaction, items:", cart.length);
      const productsData = cart.map((c) => ({
        product: c.product._id,
        quantity: c.quantity,
      }));
      await axios.post(
        `${api_url}/sales/transaction`,
        { products: productsData },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      console.info("[POS] charge: transaction created, total:", total);
      setLastTotal(total);
      setLastCount(itemCount);
      setCart([]);
      setCartExpanded(false);
      setSuccessVisible(true);
    } catch (error) {
      console.error("[POS] charge error:", error.response?.data?.message || error.message);
      Alert.alert("Error", error.response?.data?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.screenPadding,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
      flex: 1,
    },
    headerBadge: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
      color: theme.isDark ? "#93c5fd" : "#1d4ed8",
      backgroundColor: theme.isDark ? "#1e3a5f" : "#dbeafe",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
      marginRight: Spacing.sm,
    },
    closeBtn: {
      padding: 4,
    },

    // Product grid
    gridContent: {
      padding: Spacing.screenPadding,
      gap: Spacing.listGap,
      paddingBottom: 8,
    },
    colWrapper: { gap: Spacing.listGap },

    // Product tile
    tile: {
      flex: 1,
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      padding: Spacing.sm,
      minHeight: 88,
      justifyContent: "space-between",
    },
    tileInCart: {
      borderColor: theme.isDark ? "#93c5fd" : "#1d4ed8",
      borderWidth: 2,
      backgroundColor: theme.isDark ? "#1e3a5f22" : "#eff6ff",
    },
    tileDisabled: {
      opacity: 0.4,
    },
    tileName: {
      fontFamily: Font.medium,
      fontSize: 13,
      color: theme.textPrimary,
      lineHeight: 17,
    },
    tilePrice: {
      fontFamily: Font.bold,
      fontSize: FontSize.body,
      color: theme.currency,
      marginTop: 4,
    },
    tileRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },
    tileStock: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.textSecondary,
    },
    qtyBadge: {
      backgroundColor: theme.isDark ? "#93c5fd" : "#1d4ed8",
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    qtyBadgeText: {
      fontFamily: Font.bold,
      fontSize: 11,
      color: theme.isDark ? "#0f172a" : "#ffffff",
    },

    // Cart panel
    cartPanel: {
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    cartHandle: {
      alignItems: "center",
      paddingTop: 8,
      paddingBottom: 4,
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
      gap: Spacing.sm,
    },
    cartLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      flex: 1,
    },
    cartMeta: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
    cartTotalText: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.currency,
    },
    emptyCartNote: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.sm,
    },

    // Cart items (expanded)
    cartItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: Spacing.lg,
      paddingVertical: 10,
    },
    cartItemName: {
      fontFamily: Font.medium,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      flex: 1,
    },
    cartItemPrice: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginRight: Spacing.md,
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
    removeBtn: {
      marginLeft: Spacing.sm,
      padding: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },

    // Charge button
    chargeBtn: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      backgroundColor: cart.length > 0 ? theme.currency : theme.border,
      borderRadius: Radius.button,
      paddingVertical: 16,
      alignItems: "center",
    },
    chargeBtnText: {
      fontFamily: Font.bold,
      fontSize: 16,
      color: cart.length > 0 ? "#ffffff" : theme.textSecondary,
    },

    // Success modal
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      alignItems: "center",
      justifyContent: "center",
      padding: Spacing.xl,
    },
    successCard: {
      backgroundColor: theme.surface,
      borderRadius: Radius.modal * 2,
      padding: Spacing.xl,
      width: "100%",
      alignItems: "center",
      gap: Spacing.md,
    },
    successIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.isDark ? "#14532d" : "#dcfce7",
      alignItems: "center",
      justifyContent: "center",
    },
    successTitle: {
      fontFamily: Font.bold,
      fontSize: 20,
      color: theme.textPrimary,
    },
    successMeta: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
    },
    successTotal: {
      fontFamily: Font.bold,
      fontSize: 28,
      color: theme.currency,
    },
    successActions: {
      flexDirection: "row",
      gap: Spacing.md,
      width: "100%",
      marginTop: Spacing.sm,
    },
    successBtnOutline: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.button,
      paddingVertical: 12,
      alignItems: "center",
    },
    successBtnOutlineText: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.button,
      color: theme.textPrimary,
    },
    successBtnFill: {
      flex: 1,
      backgroundColor: theme.isDark ? "#0f172a" : "#1a2235",
      borderRadius: Radius.button,
      paddingVertical: 12,
      alignItems: "center",
    },
    successBtnFillText: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.button,
      color: "#ffffff",
    },
  });

  const renderTile = ({ item }) => {
    const qty = cartQty(item._id);
    const inCart = qty > 0;
    const disabled = item.stock === 0;
    return (
      <TouchableOpacity
        style={[s.tile, inCart && s.tileInCart, disabled && s.tileDisabled]}
        onPress={() => addToCart(item)}
        disabled={disabled}
        activeOpacity={0.75}
      >
        <Text style={s.tileName} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={s.tileRow}>
          <View>
            <Text style={s.tilePrice}>₱{item.price.toFixed(2)}</Text>
            <Text style={s.tileStock}>
              {disabled ? "Out of stock" : `Stock: ${item.stock}`}
            </Text>
          </View>
          {inCart && (
            <View style={s.qtyBadge}>
              <Text style={s.qtyBadgeText}>{qty}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>POS Mode</Text>
        {itemCount > 0 && (
          <Text style={s.headerBadge}>{itemCount} in cart</Text>
        )}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <SearchBar
        onChangeText={(text) => {
          setSearchQuery(text);
          fetchProducts(text);
        }}
        placeholder="Search products..."
        style={{ marginHorizontal: Spacing.screenPadding, marginVertical: Spacing.sm }}
      />

      {/* Product grid */}
      <Loading isLoading={loading} message="Loading products...">
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={3}
          columnWrapperStyle={s.colWrapper}
          contentContainerStyle={s.gridContent}
          renderItem={renderTile}
          ListEmptyComponent={
            <Text
              style={{
                textAlign: "center",
                color: theme.textSecondary,
                fontFamily: Font.regular,
                fontSize: FontSize.body,
                paddingVertical: Spacing.xl,
              }}
            >
              No products found.
            </Text>
          }
        />
      </Loading>

      {/* Cart panel — always visible */}
      <View style={s.cartPanel}>
        <TouchableOpacity
          style={s.cartHandle}
          onPress={() => cart.length > 0 && setCartExpanded((v) => !v)}
          activeOpacity={cart.length > 0 ? 0.7 : 1}
        >
          <View style={s.cartHandleBar} />
        </TouchableOpacity>

        {/* Summary row */}
        <View style={s.cartHeaderRow}>
          <Text style={s.cartLabel}>Cart</Text>
          {cart.length > 0 ? (
            <>
              <Text style={s.cartMeta}>
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </Text>
              <TouchableOpacity onPress={() => setCartExpanded((v) => !v)}>
                <MaterialIcons
                  name={cartExpanded ? "expand-more" : "expand-less"}
                  size={20}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {/* Empty note */}
        {cart.length === 0 && (
          <Text style={s.emptyCartNote}>Tap a product to add it to the cart.</Text>
        )}

        {/* Expanded items */}
        {cartExpanded && cart.length > 0 && (
          <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
            {cart.map((item, i) => (
              <View key={item.product._id}>
                {i > 0 && <View style={s.divider} />}
                <View style={s.cartItem}>
                  <Text style={s.cartItemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={s.cartItemPrice}>
                    ₱{(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => updateQty(item.product._id, -1)}
                  >
                    <MaterialIcons name="remove" size={16} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <Text style={s.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => {
                      if (item.quantity < item.product.stock) {
                        updateQty(item.product._id, 1);
                      }
                    }}
                  >
                    <MaterialIcons name="add" size={16} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.removeBtn}
                    onPress={() => removeFromCart(item.product._id)}
                  >
                    <MaterialIcons name="delete-outline" size={18} color={theme.isDark ? "#f87171" : "#dc2626"} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Charge button */}
        <TouchableOpacity
          style={s.chargeBtn}
          onPress={charge}
          disabled={cart.length === 0 || submitting}
          activeOpacity={0.85}
        >
          <Text style={s.chargeBtnText}>
            {cart.length === 0
              ? "Cart is empty"
              : submitting
              ? "Processing..."
              : `Charge  ₱${total.toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Success modal */}
      <Modal visible={successVisible} transparent animationType="fade">
        <View style={s.overlay}>
          <View style={s.successCard}>
            <View style={s.successIcon}>
              <MaterialIcons
                name="check"
                size={32}
                color={theme.isDark ? "#86efac" : "#16a34a"}
              />
            </View>
            <Text style={s.successTitle}>Transaction Complete</Text>
            <Text style={s.successMeta}>
              {lastCount} item{lastCount !== 1 ? "s" : ""} sold
            </Text>
            <Text style={s.successTotal}>₱{lastTotal.toFixed(2)}</Text>
            <View style={s.successActions}>
              <TouchableOpacity
                style={s.successBtnOutline}
                onPress={() => setSuccessVisible(false)}
              >
                <Text style={s.successBtnOutlineText}>New Sale</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.successBtnFill}
                onPress={() => {
                  setSuccessVisible(false);
                  router.push("/sales");
                }}
              >
                <Text style={s.successBtnFillText}>View Sales</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
