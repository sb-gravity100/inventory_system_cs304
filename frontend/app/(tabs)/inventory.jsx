import {
  View,
  Text,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { FAB, SearchBar, Loading } from "../../components/ui";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../components/ThemeProvider";
import { useAuth } from "../../context/AuthContext";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { router, useFocusEffect } from "expo-router";
import ProductCard from "../../components/ProductCard";
import { MaterialIcons } from "@expo/vector-icons";
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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    axios
      .get(`${api_url}/categories`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      })
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProducts(1, searchQuery, selectedCategory);
    }, [])
  );

  const fetchProducts = async (pageNum, name = "", category = null) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNum, limit: 20, name };
      if (category) params.category = category;

      const response = await axios.get(`${api_url}/products`, {
        headers: { Authorization: `Bearer ${authState.token}` },
        params,
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
      fetchProducts(page + 1, searchQuery, selectedCategory);
    }
  };

  const getActions = () => {
    const role = user?.role?.toLowerCase();
    const actions = [
      {
        label: "POS Mode",
        icon: "point-of-sale",
        onPress: () => router.push("/pos"),
      },
    ];
    if (role === "manager" || role === "admin") {
      actions.push({
        label: "Add Product",
        icon: "add-box",
        onPress: () => router.push("/add-product"),
      });
      actions.push({
        label: "Edit Categories",
        icon: "label",
        onPress: () => router.push("/categories"),
      });
    }
    return actions;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts(1, searchQuery, selectedCategory);
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
    filterRow: {
      marginHorizontal: Spacing.screenPadding,
      marginBottom: Spacing.sm,
    },
    filterBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.input,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
    },
    filterBtnText: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textPrimary,
    },
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.35)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      paddingBottom: 32,
    },
    sheetTitle: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sheetOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.lg,
      paddingVertical: 14,
    },
    sheetOptionText: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textPrimary,
    },
    sheetOptionTextActive: {
      fontFamily: Font.semiBold,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
  });

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <View style={s.header}>
        <Text style={s.screenTitle}>Inventory</Text>
        <Text style={s.screenSubtitle}>{totalProducts} products</Text>
      </View>

      <SearchBar
        onChangeText={(text) => {
          setSearchQuery(text);
          fetchProducts(1, text, selectedCategory);
        }}
        placeholder="Search products..."
        style={{ marginHorizontal: Spacing.screenPadding, marginVertical: Spacing.sm }}
      />

      {categories.length > 0 && (
        <View style={s.filterRow}>
          <TouchableOpacity style={s.filterBtn} onPress={() => setCategoryPickerOpen(true)} activeOpacity={0.7}>
            <Text style={s.filterBtnText}>
              {selectedCategory ? categories.find((c) => c._id === selectedCategory)?.name ?? "All categories" : "All categories"}
            </Text>
            <MaterialIcons name="expand-more" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={categoryPickerOpen} transparent animationType="slide" onRequestClose={() => setCategoryPickerOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setCategoryPickerOpen(false)}>
          <Pressable style={s.sheet} onPress={() => {}}>
            <Text style={s.sheetTitle}>Filter by category</Text>
            <TouchableOpacity
              style={s.sheetOption}
              onPress={() => {
                setSelectedCategory(null);
                fetchProducts(1, searchQuery, null);
                setCategoryPickerOpen(false);
              }}
            >
              <Text style={[s.sheetOptionText, !selectedCategory && s.sheetOptionTextActive]}>All categories</Text>
              {!selectedCategory && <View style={[s.dot, { backgroundColor: theme.textPrimary }]} />}
            </TouchableOpacity>
            {categories.map((cat) => {
              const active = selectedCategory === cat._id;
              const accent = cat.color || theme.textSecondary;
              return (
                <TouchableOpacity
                  key={cat._id}
                  style={s.sheetOption}
                  onPress={() => {
                    setSelectedCategory(cat._id);
                    fetchProducts(1, searchQuery, cat._id);
                    setCategoryPickerOpen(false);
                  }}
                >
                  <Text style={[s.sheetOptionText, active && s.sheetOptionTextActive]}>{cat.name}</Text>
                  {active && <View style={[s.dot, { backgroundColor: accent }]} />}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

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
            <ProductCard product={item} theme={theme} />
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
    </SafeAreaView>
  );
}
