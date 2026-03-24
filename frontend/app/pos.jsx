import {
  View,
  Text,
  FlatList,
  Alert,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Image,
  TextInput,
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

  // Catalogue
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Cart
  const [cart, setCart] = useState([]);
  const [heldCart, setHeldCart] = useState(null);

  // Checkout extras
  const [discountType, setDiscountType] = useState("flat"); // "flat" | "pct"
  const [discountValue, setDiscountValue] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [lastTotal, setLastTotal] = useState(0);
  const [lastCount, setLastCount] = useState(0);

  // ── Derived ────────────────────────────────────────────────────────────────
  const subtotal = cart.reduce((s, c) => s + c.product.price * c.quantity, 0);
  const discountNum = parseFloat(discountValue) || 0;
  const discountAmount =
    discountType === "pct"
      ? subtotal * Math.min(discountNum, 100) / 100
      : Math.min(discountNum, subtotal);
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = cart.reduce((s, c) => s + c.quantity, 0);

  // ── Data fetching ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories();
    fetchProducts("", null);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${api_url}/categories`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      setCategories(res.data);
      console.debug("[POS] categories loaded:", res.data.length);
    } catch (err) {
      console.warn("[POS] fetchCategories error:", err.message);
    }
  };

  const fetchProducts = async (name = searchQuery, category = selectedCategory) => {
    try {
      setLoading(true);
      const params = { limit: 100, name };
      if (category) params.category = category;
      const res = await axios.get(`${api_url}/products`, {
        headers: { Authorization: `Bearer ${authState.token}` },
        params,
      });
      setProducts(res.data.products);
      console.debug("[POS] products loaded:", res.data.products.length);
    } catch (err) {
      console.error("[POS] fetchProducts error:", err.message);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ── Cart helpers ───────────────────────────────────────────────────────────
  const cartQty = (productId) =>
    cart.find((c) => c.product._id === productId)?.quantity ?? 0;

  const addToCart = (product) => {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((c) => c.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((c) =>
          c.product._id === product._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    console.debug("[POS] addToCart:", product.name);
  };

  const updateQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.product._id === productId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const setQty = (productId, value, maxStock) => {
    const n = parseInt(value, 10);
    if (isNaN(n) || n <= 0) {
      setCart((prev) => prev.filter((c) => c.product._id !== productId));
    } else {
      setCart((prev) =>
        prev.map((c) =>
          c.product._id === productId
            ? { ...c, quantity: Math.min(n, maxStock) }
            : c
        )
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((c) => c.product._id !== productId));
  };

  // ── Hold / Recall ──────────────────────────────────────────────────────────
  const holdCart = () => {
    if (cart.length === 0) return;
    console.info("[POS] holdCart:", cart.length, "items saved");
    setHeldCart(cart);
    setCart([]);
    setDiscountValue("");
    setNotes("");
  };

  const recallCart = () => {
    if (!heldCart) return;
    console.info("[POS] recallCart: restoring", heldCart.length, "items");
    const current = cart;
    setCart(heldCart);
    setHeldCart(current.length > 0 ? current : null);
    setDiscountValue("");
    setNotes("");
  };

  // ── Charge ─────────────────────────────────────────────────────────────────
  const charge = async () => {
    if (cart.length === 0) return;
    try {
      setSubmitting(true);
      console.info("[POS] charge: items:", cart.length, "total:", total, "discount:", discountAmount);
      const productsData = cart.map((c) => ({
        product: c.product._id,
        quantity: c.quantity,
      }));
      await axios.post(
        `${api_url}/sales/transaction`,
        { products: productsData, discount: discountAmount, notes: notes.trim() },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      console.info("[POS] charge: success");
      setLastTotal(total);
      setLastCount(itemCount);
      setCart([]);
      setDiscountValue("");
      setNotes("");
      setSuccessVisible(true);
    } catch (err) {
      console.error("[POS] charge error:", err.response?.data?.message || err.message);
      Alert.alert("Error", err.response?.data?.message || "Transaction failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
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
      gap: Spacing.sm,
    },
    headerTitle: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
      flex: 1,
    },
    cartBadge: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
      color: theme.isDark ? "#93c5fd" : "#1d4ed8",
      backgroundColor: theme.isDark ? "#1e3a5f" : "#dbeafe",
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
    },
    closeBtn: { padding: 4 },

    // Category chips
    chipsRow: {
      flexGrow: 0,
      paddingVertical: Spacing.sm,
    },
    chipsContent: {
      paddingHorizontal: Spacing.screenPadding,
      gap: Spacing.sm,
      flexDirection: "row",
      alignItems: "center",
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.surface,
    },
    chipActive: {
      backgroundColor: theme.isDark ? "#1e3a5f" : "#1a2235",
      borderColor: theme.isDark ? "#1e3a5f" : "#1a2235",
    },
    chipText: {
      fontFamily: Font.medium,
      fontSize: 13,
      color: theme.textSecondary,
    },
    chipTextActive: {
      color: "#ffffff",
    },

    // Grid
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
      overflow: "hidden",
    },
    tileInCart: {
      borderColor: theme.isDark ? "#93c5fd" : "#1d4ed8",
      borderWidth: 2,
    },
    tileDisabled: { opacity: 0.38 },
    imageArea: {
      height: 90,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
    },
    tileImage: { width: "100%", height: "100%" },
    tileEmoji: { fontSize: 36 },
    qtyBadge: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: theme.isDark ? "#93c5fd" : "#1d4ed8",
      borderRadius: 10,
      minWidth: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    qtyBadgeText: {
      fontFamily: Font.bold,
      fontSize: 12,
      color: theme.isDark ? "#0f172a" : "#ffffff",
    },
    tileBody: { padding: Spacing.sm },
    tileName: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      marginBottom: 4,
    },
    catBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: Radius.button,
      marginBottom: 4,
    },
    catBadgeText: {
      fontFamily: Font.medium,
      fontSize: 10,
      color: "#ffffff",
    },
    tileFooter: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
    },
    tilePrice: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.currency,
    },
    tileStock: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.textSecondary,
    },

    // Cart panel
    cartPanel: {
      backgroundColor: theme.surface,
      borderTopWidth: 1,
      borderTopColor: theme.border,
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
    holdBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    holdBtnText: {
      fontFamily: Font.medium,
      fontSize: 12,
      color: theme.textSecondary,
    },
    recallBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: theme.isDark ? "#1e3a5f" : "#dbeafe",
    },
    recallBtnText: {
      fontFamily: Font.semiBold,
      fontSize: 12,
      color: theme.isDark ? "#93c5fd" : "#1d4ed8",
    },
    emptyNote: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      paddingHorizontal: Spacing.lg,
      paddingBottom: Spacing.sm,
    },

    // Cart items
    cartScroll: { maxHeight: 200 },
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
    cartItemLineTotal: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
      color: theme.currency,
      minWidth: 56,
      textAlign: "right",
      marginRight: Spacing.sm,
    },
    qtyBtn: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.isDark ? "#374151" : "#f3f4f6",
      alignItems: "center",
      justifyContent: "center",
    },
    qtyInput: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      minWidth: 28,
      textAlign: "center",
      paddingVertical: 0,
    },
    removeBtn: { marginLeft: Spacing.xs, padding: 2 },
    cartDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginHorizontal: Spacing.lg,
    },

    // Checkout section
    checkoutSection: {
      borderTopWidth: 1,
      borderTopColor: theme.border,
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.sm,
    },
    checkoutRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: Spacing.sm,
      gap: Spacing.sm,
    },
    checkoutLabel: {
      fontFamily: Font.medium,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      width: 62,
    },
    discountInput: {
      flex: 1,
      height: 34,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.input,
      paddingHorizontal: Spacing.sm,
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      backgroundColor: theme.background,
    },
    typeToggle: {
      width: 34,
      height: 34,
      borderRadius: Radius.input,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.background,
    },
    typeToggleActive: {
      backgroundColor: theme.isDark ? "#1e3a5f" : "#1a2235",
      borderColor: theme.isDark ? "#1e3a5f" : "#1a2235",
    },
    typeToggleText: {
      fontFamily: Font.semiBold,
      fontSize: 13,
      color: theme.textSecondary,
    },
    typeToggleTextActive: { color: "#ffffff" },
    notesInput: {
      flex: 1,
      height: 34,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.input,
      paddingHorizontal: Spacing.sm,
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      backgroundColor: theme.background,
    },

    // Totals
    totalsSection: {
      paddingTop: Spacing.xs,
      paddingBottom: Spacing.sm,
      gap: 4,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalRowFinal: {
      marginTop: 4,
      paddingTop: 6,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    totalLabel: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
    totalValue: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
      color: theme.textPrimary,
    },
    discountValue: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
      color: theme.isDark ? "#f87171" : "#dc2626",
    },
    totalLabelFinal: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
    },
    totalValueFinal: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.currency,
    },

    // Charge button
    chargeBtn: {
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.xs,
      marginBottom: Spacing.md,
      backgroundColor: theme.currency,
      borderRadius: Radius.button,
      paddingVertical: 16,
      alignItems: "center",
    },
    chargeBtnDisabled: {
      backgroundColor: theme.border,
    },
    chargeBtnText: {
      fontFamily: Font.bold,
      fontSize: 16,
      color: "#ffffff",
    },
    chargeBtnTextDisabled: {
      color: theme.textSecondary,
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

  // ── Render helpers ─────────────────────────────────────────────────────────
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
        <View style={s.imageArea}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={s.tileImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={s.tileEmoji}>📦</Text>
          )}
          {inCart && (
            <View style={s.qtyBadge}>
              <Text style={s.qtyBadgeText}>{qty}</Text>
            </View>
          )}
        </View>
        <View style={s.tileBody}>
          <Text style={s.tileName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.category && (
            <View
              style={[
                s.catBadge,
                { backgroundColor: item.category.color || theme.textSecondary },
              ]}
            >
              <Text style={s.catBadgeText}>{item.category.name}</Text>
            </View>
          )}
          <View style={s.tileFooter}>
            <Text style={s.tilePrice}>₱{item.price.toFixed(2)}</Text>
            <Text style={s.tileStock}>
              {disabled ? "Out" : `×${item.stock}`}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>POS Mode</Text>
        {itemCount > 0 && (
          <Text style={s.cartBadge}>
            {itemCount} in cart
          </Text>
        )}
        <TouchableOpacity style={s.closeBtn} onPress={() => router.back()}>
          <MaterialIcons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Category chips */}
      {categories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.chipsRow}
          contentContainerStyle={s.chipsContent}
        >
          <TouchableOpacity
            style={[s.chip, !selectedCategory && s.chipActive]}
            onPress={() => {
              setSelectedCategory(null);
              fetchProducts(searchQuery, null);
            }}
          >
            <Text style={[s.chipText, !selectedCategory && s.chipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => {
            const active = selectedCategory === cat._id;
            return (
              <TouchableOpacity
                key={cat._id}
                style={[
                  s.chip,
                  active && s.chipActive,
                  active && cat.color && { backgroundColor: cat.color, borderColor: cat.color },
                ]}
                onPress={() => {
                  setSelectedCategory(cat._id);
                  fetchProducts(searchQuery, cat._id);
                }}
              >
                <Text style={[s.chipText, active && s.chipTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Search */}
      <SearchBar
        onChangeText={(text) => {
          setSearchQuery(text);
          fetchProducts(text, selectedCategory);
        }}
        placeholder="Search products..."
        style={{
          marginHorizontal: Spacing.screenPadding,
          marginBottom: Spacing.sm,
        }}
      />

      {/* Product grid */}
      <Loading isLoading={loading} message="Loading products...">
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={s.colWrapper}
          contentContainerStyle={s.gridContent}
          keyboardShouldPersistTaps="handled"
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

      {/* ── Cart panel ── */}
      <View style={s.cartPanel}>
        {/* Header row */}
        <View style={s.cartHeaderRow}>
          <Text style={s.cartLabel}>
            Cart
            {itemCount > 0
              ? `  ·  ${itemCount} item${itemCount !== 1 ? "s" : ""}`
              : ""}
          </Text>
          {heldCart && (
            <TouchableOpacity style={s.recallBtn} onPress={recallCart}>
              <MaterialIcons
                name="restore"
                size={14}
                color={theme.isDark ? "#93c5fd" : "#1d4ed8"}
              />
              <Text style={s.recallBtnText}>Recall</Text>
            </TouchableOpacity>
          )}
          {cart.length > 0 && (
            <TouchableOpacity style={s.holdBtn} onPress={holdCart}>
              <MaterialIcons name="pause" size={14} color={theme.textSecondary} />
              <Text style={s.holdBtnText}>Hold</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Empty state */}
        {cart.length === 0 && (
          <Text style={s.emptyNote}>Tap a product to start a sale.</Text>
        )}

        {/* Cart items */}
        {cart.length > 0 && (
          <ScrollView style={s.cartScroll} keyboardShouldPersistTaps="handled">
            {cart.map((item, i) => (
              <View key={item.product._id}>
                {i > 0 && <View style={s.cartDivider} />}
                <View style={s.cartItem}>
                  <Text style={s.cartItemName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={s.cartItemLineTotal}>
                    ₱{(item.product.price * item.quantity).toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => updateQty(item.product._id, -1)}
                  >
                    <MaterialIcons name="remove" size={15} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <TextInput
                    style={s.qtyInput}
                    value={String(item.quantity)}
                    onChangeText={(v) =>
                      setQty(item.product._id, v, item.product.stock)
                    }
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={s.qtyBtn}
                    onPress={() => {
                      if (item.quantity < item.product.stock) {
                        updateQty(item.product._id, 1);
                      }
                    }}
                  >
                    <MaterialIcons name="add" size={15} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.removeBtn}
                    onPress={() => removeFromCart(item.product._id)}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={18}
                      color={theme.isDark ? "#f87171" : "#dc2626"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Discount + Notes + Totals */}
        {cart.length > 0 && (
          <View style={s.checkoutSection}>
            {/* Discount */}
            <View style={s.checkoutRow}>
              <Text style={s.checkoutLabel}>Discount</Text>
              <TextInput
                style={s.discountInput}
                value={discountValue}
                onChangeText={setDiscountValue}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity
                style={[
                  s.typeToggle,
                  discountType === "flat" && s.typeToggleActive,
                ]}
                onPress={() => setDiscountType("flat")}
              >
                <Text
                  style={[
                    s.typeToggleText,
                    discountType === "flat" && s.typeToggleTextActive,
                  ]}
                >
                  ₱
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.typeToggle,
                  discountType === "pct" && s.typeToggleActive,
                ]}
                onPress={() => setDiscountType("pct")}
              >
                <Text
                  style={[
                    s.typeToggleText,
                    discountType === "pct" && s.typeToggleTextActive,
                  ]}
                >
                  %
                </Text>
              </TouchableOpacity>
            </View>
            {/* Notes */}
            <View style={s.checkoutRow}>
              <Text style={s.checkoutLabel}>Notes</Text>
              <TextInput
                style={s.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Optional note..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            {/* Totals breakdown */}
            <View style={s.totalsSection}>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal</Text>
                <Text style={s.totalValue}>₱{subtotal.toFixed(2)}</Text>
              </View>
              {discountAmount > 0 && (
                <View style={s.totalRow}>
                  <Text style={s.totalLabel}>
                    Discount
                    {discountType === "pct" ? ` (${discountNum}%)` : ""}
                  </Text>
                  <Text style={s.discountValue}>
                    −₱{discountAmount.toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={[s.totalRow, s.totalRowFinal]}>
                <Text style={s.totalLabelFinal}>Total</Text>
                <Text style={s.totalValueFinal}>₱{total.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Charge button */}
        <TouchableOpacity
          style={[s.chargeBtn, cart.length === 0 && s.chargeBtnDisabled]}
          onPress={charge}
          disabled={cart.length === 0 || submitting}
          activeOpacity={0.85}
        >
          <Text
            style={[
              s.chargeBtnText,
              cart.length === 0 && s.chargeBtnTextDisabled,
            ]}
          >
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
