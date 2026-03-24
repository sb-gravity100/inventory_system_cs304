import { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../components/ThemeProvider";
import { Header, Input, Button, FormField, Loading } from "../../components/ui";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

export default function ProductDetailScreen() {
  const { productId } = useLocalSearchParams();
  const { authState, user } = useAuth();
  const { theme } = useTheme();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  // Edit form fields
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editCostPrice, setEditCostPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategory, setEditCategory] = useState(null);
  const [editLowStock, setEditLowStock] = useState("");

  // Stock adjustment
  const [stockQty, setStockQty] = useState("");
  const [stockUpdating, setStockUpdating] = useState(false);

  const canEdit = user?.role === "manager" || user?.role === "admin";

  useEffect(() => {
    fetchProduct();
    if (canEdit) fetchCategories();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/products/${productId}`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      setProduct(res.data);
    } catch {
      Alert.alert("Error", "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${api_url}/categories`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      setCategories(res.data);
    } catch {}
  };

  const startEditing = () => {
    setEditName(product.name);
    setEditSku(product.sku || "");
    setEditPrice(String(product.price));
    setEditCostPrice(product.costPrice ? String(product.costPrice) : "");
    setEditImageUrl(product.imageUrl || "");
    setEditCategory(product.category?._id || null);
    setEditLowStock(product.low_stock_threshold ? String(product.low_stock_threshold) : "");
    setEditing(true);
  };

  const cancelEditing = () => setEditing(false);

  const handleSave = async () => {
    if (!editName.trim() || !editPrice) {
      Alert.alert("Error", "Name and selling price are required");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(
        `${api_url}/products/${productId}`,
        {
          name: editName.trim(),
          price: parseFloat(editPrice),
          sku: editSku.trim() || null,
          costPrice: editCostPrice ? parseFloat(editCostPrice) : 0,
          imageUrl: editImageUrl.trim() || null,
          category: editCategory || null,
          low_stock_threshold: editLowStock ? parseInt(editLowStock) : 0,
        },
        { headers: { Authorization: `Bearer ${authState.token}` } },
      );
      setProduct(res.data);
      setEditing(false);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveToggle = () => {
    const isActive = product.isActive;
    Alert.alert(
      isActive ? "Archive Product" : "Restore Product",
      isActive
        ? "This will hide the product from inventory."
        : "This will make the product active again.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isActive ? "Archive" : "Restore",
          style: isActive ? "destructive" : "default",
          onPress: async () => {
            try {
              const res = await axios.patch(
                `${api_url}/products/${productId}/${isActive ? "archive" : "restore"}`,
                {},
                { headers: { Authorization: `Bearer ${authState.token}` } },
              );
              setProduct(res.data);
            } catch {
              Alert.alert("Error", "Failed to update product status");
            }
          },
        },
      ],
    );
  };

  const handleAddStock = async () => {
    const qty = parseInt(stockQty);
    if (!qty || qty <= 0) {
      Alert.alert("Error", "Enter a positive quantity");
      return;
    }
    setStockUpdating(true);
    try {
      const res = await axios.post(
        `${api_url}/products/${productId}/increase-stock`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${authState.token}` } },
      );
      setProduct(res.data);
      setStockQty("");
    } catch {
      Alert.alert("Error", "Failed to update stock");
    } finally {
      setStockUpdating(false);
    }
  };

  const handleSetStock = async () => {
    const qty = parseInt(stockQty);
    if (isNaN(qty) || qty < 0) {
      Alert.alert("Error", "Enter a valid non-negative quantity");
      return;
    }
    setStockUpdating(true);
    try {
      const res = await axios.post(
        `${api_url}/products/${productId}/update-stocks`,
        { quantity: qty },
        { headers: { Authorization: `Bearer ${authState.token}` } },
      );
      setProduct(res.data);
      setStockQty("");
    } catch {
      Alert.alert("Error", "Failed to set stock");
    } finally {
      setStockUpdating(false);
    }
  };

  const margin =
    product?.costPrice > 0
      ? Math.round(((product.price - product.costPrice) / product.price) * 100)
      : null;

  const rightActions = canEdit
    ? [
        <TouchableOpacity
          key="edit-toggle"
          onPress={editing ? cancelEditing : startEditing}
          style={{ padding: 4 }}
        >
          <MaterialIcons
            name={editing ? "close" : "edit"}
            size={22}
            color={theme.textPrimary}
          />
        </TouchableOpacity>,
      ]
    : [];

  const s = StyleSheet.create({
    imageArea: {
      height: 160,
      borderRadius: Radius.card,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      marginBottom: Spacing.sectionGap,
    },
    image: { width: "100%", height: "100%" },
    emoji: { fontSize: 56 },
    infoCard: {
      borderRadius: Radius.card,
      borderWidth: 1,
      padding: Spacing.cardPadding,
      marginBottom: Spacing.sectionGap,
    },
    productName: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      marginBottom: Spacing.sm,
    },
    categoryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: Radius.button,
      marginBottom: Spacing.sm,
    },
    categoryText: { fontFamily: Font.medium, fontSize: 12, color: "#ffffff" },
    skuText: { fontFamily: Font.regular, fontSize: FontSize.listSecondary, marginBottom: Spacing.sm },
    pricesRow: { flexDirection: "row", gap: Spacing.xl, marginBottom: Spacing.xs },
    priceGroup: {},
    priceLabel: { fontFamily: Font.regular, fontSize: FontSize.listSecondary, marginBottom: 2 },
    priceVal: { fontFamily: Font.bold, fontSize: FontSize.listPrimary },
    thresholdText: { fontFamily: Font.regular, fontSize: FontSize.listSecondary, marginTop: Spacing.sm },
    stockCard: {
      borderRadius: Radius.card,
      borderWidth: 1,
      padding: Spacing.cardPadding,
      marginBottom: Spacing.sectionGap,
    },
    stockLabel: { fontFamily: Font.regular, fontSize: FontSize.listSecondary, marginBottom: 4 },
    stockValue: { fontFamily: Font.black, fontSize: 40, lineHeight: 44 },
    stockRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.md, alignItems: "center" },
    stepperRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, flex: 1 },
    stepBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: theme.isDark ? "#374151" : "#f3f4f6",
      alignItems: "center",
      justifyContent: "center",
    },
    stepInput: {
      flex: 1,
      height: 34,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.input,
      textAlign: "center",
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      backgroundColor: theme.background,
    },
    editSection: { marginBottom: Spacing.sectionGap },
    actionRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
    chip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: Radius.button, borderWidth: 1 },
    chipText: { fontFamily: Font.medium, fontSize: FontSize.body },
    archivedBanner: {
      borderRadius: Radius.card,
      padding: Spacing.sm,
      marginBottom: Spacing.sectionGap,
      alignItems: "center",
    },
    archivedText: { fontFamily: Font.medium, fontSize: FontSize.listSecondary, color: "#ffffff" },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Header
        title={editing ? "Editing Product" : (product?.name || "Product")}
        showBack
        rightActions={rightActions}
      />

      <Loading isLoading={loading} message="Loading product...">
        {product && (
          <ScrollView
            contentContainerStyle={{ padding: Spacing.screenPadding, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Archived banner */}
            {!product.isActive && (
              <View style={[s.archivedBanner, { backgroundColor: theme.statusCancelled }]}>
                <Text style={s.archivedText}>This product is archived</Text>
              </View>
            )}

            {/* Image */}
            <View style={[s.imageArea, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={s.image} resizeMode="cover" />
              ) : (
                <Text style={s.emoji}>📦</Text>
              )}
            </View>

            {/* Info / Edit section */}
            {editing ? (
              <View style={s.editSection}>
                <FormField label="Product Name *">
                  <Input
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Product name"
                  />
                </FormField>
                <FormField label="SKU">
                  <Input
                    value={editSku}
                    onChangeText={setEditSku}
                    placeholder="e.g. PRD-001"
                    autoCapitalize="characters"
                  />
                </FormField>
                <FormField label="Selling Price *">
                  <Input
                    value={editPrice}
                    onChangeText={setEditPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </FormField>
                <FormField label="Cost Price">
                  <Input
                    value={editCostPrice}
                    onChangeText={setEditCostPrice}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                  />
                </FormField>
                <FormField label="Low Stock Threshold">
                  <Input
                    value={editLowStock}
                    onChangeText={setEditLowStock}
                    placeholder="0"
                    keyboardType="number-pad"
                  />
                </FormField>
                {categories.length > 0 && (
                  <FormField label="Category">
                    <View style={s.chipRow}>
                      {categories.map((cat) => {
                        const active = editCategory === cat._id;
                        const accent = cat.color || theme.primary;
                        return (
                          <TouchableOpacity
                            key={cat._id}
                            style={[
                              s.chip,
                              {
                                backgroundColor: active ? accent : "transparent",
                                borderColor: accent,
                              },
                            ]}
                            onPress={() => setEditCategory(active ? null : cat._id)}
                          >
                            <Text style={[s.chipText, { color: active ? "#ffffff" : accent }]}>
                              {cat.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </FormField>
                )}
                <FormField label="Image URL">
                  <Input
                    value={editImageUrl}
                    onChangeText={setEditImageUrl}
                    placeholder="https://..."
                    keyboardType="url"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </FormField>
                <View style={s.actionRow}>
                  <Button
                    title={saving ? "Saving..." : "Save Changes"}
                    variant="primary"
                    onPress={handleSave}
                    disabled={saving}
                    style={{ flex: 2 }}
                  />
                  <Button
                    title={product.isActive ? "Archive" : "Restore"}
                    variant={product.isActive ? "error" : "success"}
                    onPress={handleArchiveToggle}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ) : (
              <View style={[s.infoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[s.productName, { color: theme.textPrimary }]}>{product.name}</Text>
                {product.category && (
                  <View
                    style={[
                      s.categoryBadge,
                      { backgroundColor: product.category.color || theme.textSecondary },
                    ]}
                  >
                    <Text style={s.categoryText}>{product.category.name}</Text>
                  </View>
                )}
                {product.sku ? (
                  <Text style={[s.skuText, { color: theme.textSecondary }]}>SKU: {product.sku}</Text>
                ) : null}
                <View style={s.pricesRow}>
                  <View style={s.priceGroup}>
                    <Text style={[s.priceLabel, { color: theme.textSecondary }]}>Selling Price</Text>
                    <Text style={[s.priceVal, { color: theme.currency }]}>₱{product.price.toFixed(2)}</Text>
                  </View>
                  {product.costPrice > 0 && (
                    <View style={s.priceGroup}>
                      <Text style={[s.priceLabel, { color: theme.textSecondary }]}>Cost Price</Text>
                      <Text style={[s.priceVal, { color: theme.textPrimary }]}>₱{product.costPrice.toFixed(2)}</Text>
                    </View>
                  )}
                  {margin !== null && (
                    <View style={s.priceGroup}>
                      <Text style={[s.priceLabel, { color: theme.textSecondary }]}>Margin</Text>
                      <Text style={[s.priceVal, { color: theme.statusCompleted }]}>{margin}%</Text>
                    </View>
                  )}
                </View>
                {product.low_stock_threshold > 0 && (
                  <Text style={[s.thresholdText, { color: theme.textSecondary }]}>
                    Low stock alert at ≤{product.low_stock_threshold} units
                  </Text>
                )}
              </View>
            )}

            {/* Stock adjustment — always visible */}
            <View style={[s.stockCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[s.stockLabel, { color: theme.textSecondary }]}>Current Stock</Text>
              <Text style={[s.stockValue, { color: theme.textPrimary }]}>{product.stock}</Text>
              <View style={s.stockRow}>
                <View style={s.stepperRow}>
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => {
                      const n = parseInt(stockQty) || 0;
                      if (n > 1) setStockQty(String(n - 1));
                    }}
                  >
                    <MaterialIcons name="remove" size={16} color={theme.textPrimary} />
                  </TouchableOpacity>
                  <TextInput
                    style={s.stepInput}
                    value={stockQty}
                    onChangeText={setStockQty}
                    placeholder="Qty"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    selectTextOnFocus
                  />
                  <TouchableOpacity
                    style={s.stepBtn}
                    onPress={() => {
                      const n = parseInt(stockQty) || 0;
                      setStockQty(String(n + 1));
                    }}
                  >
                    <MaterialIcons name="add" size={16} color={theme.textPrimary} />
                  </TouchableOpacity>
                </View>
                <Button
                  title="Add"
                  variant="success"
                  onPress={handleAddStock}
                  disabled={stockUpdating}
                  style={{ flex: 1 }}
                />
                <Button
                  title="Set"
                  variant="outline"
                  onPress={handleSetStock}
                  disabled={stockUpdating}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </Loading>
    </SafeAreaView>
  );
}
