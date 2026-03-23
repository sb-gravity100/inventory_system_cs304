import { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import axios from "axios";
import Header from "../components/ui/Header";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import FormField from "../components/ui/FormField";
import { Spacing } from "../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

export default function AddProductScreen() {
  const { authState } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price || !stock) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setSaving(true);
    try {
      await axios.post(
        `${api_url}/products`,
        { name, price: parseFloat(price), stock: parseInt(stock) },
        { headers: { Authorization: `Bearer ${authState.token}` } },
      );
      router.back();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <Header title="Add Product" showBack />
      <ScrollView contentContainerStyle={{ padding: Spacing.screenPadding }}>
        <FormField label="Product Name">
          <Input
            placeholder="Enter product name"
            value={name}
            onChangeText={setName}
          />
        </FormField>
        <FormField label="Price">
          <Input
            placeholder="0.00"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </FormField>
        <FormField label="Initial Stock">
          <Input
            placeholder="0"
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
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
