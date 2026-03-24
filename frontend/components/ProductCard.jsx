import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { Font, FontSize, Spacing, Radius } from "../constants/colors";

const PLACEHOLDER_EMOJI = "📦";

export default function ProductCard({ product, theme }) {
  const margin =
    product.costPrice > 0
      ? Math.round(((product.price - product.costPrice) / product.price) * 100)
      : null;

  const s = StyleSheet.create({
    tile: {
      backgroundColor: theme.surface,
      borderRadius: Radius.card,
      borderWidth: 1,
      borderColor: theme.border,
      flex: 1,
      overflow: "hidden",
    },
    imageArea: {
      height: 80,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
    },
    image: {
      width: "100%",
      height: "100%",
    },
    emoji: {
      fontSize: 32,
    },
    body: {
      padding: Spacing.cardPadding,
    },
    name: {
      fontFamily: Font.semiBold,
      fontSize: FontSize.body,
      color: theme.textPrimary,
      marginBottom: Spacing.xs,
    },
    categoryBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: Radius.button,
      marginBottom: Spacing.xs,
    },
    categoryText: {
      fontFamily: Font.medium,
      fontSize: 11,
      color: "#ffffff",
    },
    sku: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.textSecondary,
      marginBottom: Spacing.xs,
    },
    row: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
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
    },
    margin: {
      fontFamily: Font.regular,
      fontSize: 11,
      color: theme.statusCompleted,
      marginTop: 2,
    },
  });

  return (
    <TouchableOpacity
      style={s.tile}
      onPress={() => router.push(`/products/${product._id}`)}
      activeOpacity={0.75}
    >
      <View style={s.imageArea}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={s.image} resizeMode="cover" />
        ) : (
          <Text style={s.emoji}>{PLACEHOLDER_EMOJI}</Text>
        )}
      </View>
      <View style={s.body}>
        <Text style={s.name} numberOfLines={2}>{product.name}</Text>
        {product.category && (
          <View style={[s.categoryBadge, { backgroundColor: product.category.color || theme.textSecondary }]}>
            <Text style={s.categoryText}>{product.category.name}</Text>
          </View>
        )}
        {product.sku ? <Text style={s.sku}>SKU: {product.sku}</Text> : null}
        <View style={s.row}>
          <Text style={s.price}>₱{product.price.toFixed(2)}</Text>
          <Text style={s.stock}>{product.stock} in stock</Text>
        </View>
        {margin !== null ? <Text style={s.margin}>{margin}% margin</Text> : null}
      </View>
    </TouchableOpacity>
  );
}
