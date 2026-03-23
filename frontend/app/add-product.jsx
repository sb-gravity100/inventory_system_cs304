import { useState, useEffect } from "react";
import { View, ScrollView, Alert, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import axios from "axios";
import Header from "../components/ui/Header";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

export default function AddProductScreen() {
  const { authState } = useAuth();
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get(`${api_url}/categories`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      })
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name || !price || !stock) {
      Alert.alert("Error", "Name, price, and stock are required");
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${api_url}/products`,
        {
          name,
          price: parseFloat(price),
          stock: parseInt(stock),
          ...(sku && { sku }),
          ...(costPrice && { costPrice: parseFloat(costPrice) }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(imageUrl && { imageUrl }),
        },
        { headers: { Authorization: `Bearer ${authState.token}` } },
      );
      router.back();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  const s = StyleSheet.create({
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.sm,
    },
    chip: {
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.button,
      borderWidth: 1,
    },
    chipText: {
      fontFamily: Font.medium,
      fontSize: FontSize.body,
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Add Product" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding }}>
        <FormField label="Product Name *">
          <Input placeholder="Enter product name" value={name} onChangeText={setName} />
        </FormField>

        <FormField label="SKU (optional)">
          <Input
            placeholder="e.g. PRD-001"
            value={sku}
            onChangeText={setSku}
            autoCapitalize="characters"
          />
        </FormField>

        <FormField label="Selling Price *">
          <Input
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </FormField>

        <FormField label="Cost Price (optional)">
          <Input
            placeholder="0.00"
            value={costPrice}
            onChangeText={setCostPrice}
            keyboardType="decimal-pad"
          />
        </FormField>

        <FormField label="Initial Stock *">
          <Input
            placeholder="0"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
          />
        </FormField>

        {categories.length > 0 && (
          <FormField label="Category (optional)">
            <View style={s.chipRow}>
              {categories.map((cat) => {
                const active = selectedCategory === cat._id;
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
                    onPress={() => setSelectedCategory(active ? null : cat._id)}
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

        <FormField label="Image URL (optional)">
          <Input
            placeholder="https://..."
            value={imageUrl}
            onChangeText={setImageUrl}
            keyboardType="url"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </FormField>

        <Button
          title={saving ? "Saving..." : "Save Product"}
          variant="primary"
          onPress={handleSave}
          disabled={saving}
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
