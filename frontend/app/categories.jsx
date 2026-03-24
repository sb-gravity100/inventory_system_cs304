import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../components/ThemeProvider";
import { Header, Input, Button, Loading } from "../components/ui";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

const api_url =
  process.env.NODE_ENV === "development"
    ? process.env.EXPO_PUBLIC_API_DEVURL
    : process.env.EXPO_PUBLIC_API_URL;

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#3b82f6", "#8b5cf6", "#ec4899", "#6b7280",
];

export default function CategoriesScreen() {
  const { authState } = useAuth();
  const { theme } = useTheme();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);

  // new category form
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [creating, setCreating] = useState(false);

  const headers = { Authorization: `Bearer ${authState.token}` };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${api_url}/categories`, { headers });
      setCategories(res.data);
    } catch {
      Alert.alert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditColor(cat.color || PRESET_COLORS[0]);
    setShowNew(false);
  };

  const cancelEdit = () => setEditingId(null);

  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(
        `${api_url}/categories/${editingId}`,
        { name: editName.trim(), color: editColor },
        { headers },
      );
      setCategories((prev) => prev.map((c) => (c._id === editingId ? res.data : c)));
      setEditingId(null);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert("Delete Category", `Delete "${cat.name}"? Products in this category will become uncategorised.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await axios.delete(`${api_url}/categories/${cat._id}`, { headers });
            setCategories((prev) => prev.filter((c) => c._id !== cat._id));
          } catch {
            Alert.alert("Error", "Failed to delete category");
          }
        },
      },
    ]);
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post(
        `${api_url}/categories`,
        { name: newName.trim(), color: newColor },
        { headers },
      );
      setCategories((prev) => [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewName("");
      setNewColor(PRESET_COLORS[0]);
      setShowNew(false);
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to create category");
    } finally {
      setCreating(false);
    }
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    listContent: { padding: Spacing.screenPadding, paddingBottom: 60 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.card,
      padding: Spacing.cardPadding,
      marginBottom: Spacing.listGap,
    },
    dot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      marginRight: Spacing.md,
      flexShrink: 0,
    },
    catName: {
      fontFamily: Font.medium,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      flex: 1,
    },
    rowActions: { flexDirection: "row", gap: Spacing.sm },
    editCard: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: Radius.card,
      padding: Spacing.cardPadding,
      marginBottom: Spacing.listGap,
    },
    editCardTitle: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginBottom: Spacing.sm,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    swatchRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginVertical: Spacing.sm },
    swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 3 },
    btnRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.sm,
      padding: Spacing.md,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: theme.textSecondary,
      marginTop: Spacing.xs,
    },
    addBtnText: {
      fontFamily: Font.medium,
      fontSize: FontSize.body,
      color: theme.textSecondary,
    },
    empty: {
      fontFamily: Font.regular,
      fontSize: FontSize.body,
      color: theme.textSecondary,
      textAlign: "center",
      paddingVertical: Spacing.xl,
    },
  });

  const ColorPicker = ({ selected, onSelect }) => (
    <View style={s.swatchRow}>
      {PRESET_COLORS.map((c) => (
        <TouchableOpacity
          key={c}
          style={[s.swatch, { backgroundColor: c, borderColor: c === selected ? theme.textPrimary : "transparent" }]}
          onPress={() => onSelect(c)}
          activeOpacity={0.8}
        />
      ))}
    </View>
  );

  const renderItem = ({ item: cat }) => {
    if (editingId === cat._id) {
      return (
        <View style={s.editCard}>
          <Text style={s.editCardTitle}>Editing</Text>
          <Input value={editName} onChangeText={setEditName} placeholder="Category name" />
          <ColorPicker selected={editColor} onSelect={setEditColor} />
          <View style={s.btnRow}>
            <Button title={saving ? "Saving..." : "Save"} variant="primary" onPress={handleSaveEdit} disabled={saving} style={{ flex: 1 }} />
            <Button title="Cancel" variant="outline" onPress={cancelEdit} style={{ flex: 1 }} />
          </View>
        </View>
      );
    }

    return (
      <View style={s.row}>
        <View style={[s.dot, { backgroundColor: cat.color || theme.textSecondary }]} />
        <Text style={s.catName}>{cat.name}</Text>
        <View style={s.rowActions}>
          <TouchableOpacity onPress={() => startEdit(cat)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="edit" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(cat)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <MaterialIcons name="delete-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const ListFooter = () => (
    <>
      {showNew ? (
        <View style={s.editCard}>
          <Text style={s.editCardTitle}>New category</Text>
          <Input value={newName} onChangeText={setNewName} placeholder="Category name" />
          <ColorPicker selected={newColor} onSelect={setNewColor} />
          <View style={s.btnRow}>
            <Button title={creating ? "Saving..." : "Create"} variant="primary" onPress={handleCreate} disabled={creating} style={{ flex: 1 }} />
            <Button title="Cancel" variant="outline" onPress={() => { setShowNew(false); setNewName(""); setNewColor(PRESET_COLORS[0]); }} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <TouchableOpacity style={s.addBtn} onPress={() => { setShowNew(true); setEditingId(null); }}>
          <MaterialIcons name="add" size={18} color={theme.textSecondary} />
          <Text style={s.addBtnText}>Add category</Text>
        </TouchableOpacity>
      )}
    </>
  );

  return (
    <SafeAreaView style={s.container}>
      <Header title="Categories" showBack />
      <Loading isLoading={loading} message="Loading categories...">
        <FlatList
          data={categories}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<Text style={s.empty}>No categories yet.</Text>}
          ListFooterComponent={<ListFooter />}
        />
      </Loading>
    </SafeAreaView>
  );
}
