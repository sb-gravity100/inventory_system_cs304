import { View, Text, StyleSheet, TouchableOpacity, Pressable } from "react-native";
import { Modal } from "./ui";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

export default function ProductCard({ product, theme, onUpdateStock }) {
  const s = StyleSheet.create({
    tile: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      padding: Spacing.cardPadding,
      flex: 1,
    },
    name: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      marginBottom: Spacing.xs,
    },
    price: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.currency,
    },
    stock: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginTop: 2,
    },
    menuBtn: {
      position: "absolute",
      top: Spacing.sm,
      right: Spacing.sm,
    },
    // modal
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: theme.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingBottom: 32,
      paddingTop: 12,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.border,
      alignSelf: "center",
      marginBottom: 16,
    },
    sheetHeader: {
      paddingHorizontal: Spacing.lg,
      paddingBottom: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
      marginBottom: 8,
    },
    sheetName: {
      fontFamily: Font.bold,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
      marginBottom: 2,
    },
    sheetMeta: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: Spacing.lg,
      gap: 14,
    },
    menuItemIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    menuItemLabel: {
      fontFamily: Font.medium,
      fontSize: FontSize.listPrimary,
      color: theme.textPrimary,
    },
    menuItemSub: {
      fontFamily: Font.regular,
      fontSize: FontSize.listSecondary,
      color: theme.textSecondary,
      marginTop: 1,
    },
    cancelBtn: {
      marginHorizontal: Spacing.lg,
      marginTop: 12,
      paddingVertical: 14,
      borderRadius: Radius.button,
      backgroundColor: theme.isDark ? "#3A3A3C" : "#F2F2F7",
      alignItems: "center",
    },
    cancelLabel: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.danger,
    },
  });

  return (
    <TouchableOpacity style={s.tile} onPress={() => onUpdateStock(product)} activeOpacity={0.75}>
      <Text style={s.name} numberOfLines={2}>{product.name}</Text>
      <Text style={s.price}>₱{product.price.toFixed(2)}</Text>
      <Text style={s.stock}>Stock: {product.stock}</Text>
    </TouchableOpacity>
  );
}
