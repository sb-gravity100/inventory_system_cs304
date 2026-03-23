import {
   View,
   Text,
   StyleSheet,
   TouchableOpacity,
   Pressable,
} from "react-native";
import { Modal, Label } from "./ui";
import { useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProductCard({ product, theme, onUpdateStock }) {
   const [menuOpen, setMenuOpen] = useState(false);

   const styles = StyleSheet.create({
      productCard: {
         backgroundColor: "#FFFFFF",
         borderRadius: 12,
         padding: 16,
         marginBottom: 12,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.1,
         shadowRadius: 4,
         elevation: 3,
      },
      productCardDark: {
         backgroundColor: "#3A3A3A",
      },
      productHeader: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "flex-start",
         marginBottom: 8,
      },
      productInfo: {
         flex: 1,
      },
      productName: {
         fontSize: 18,
         fontWeight: "600",
         color: theme.textPrimary,
         marginBottom: 8,
      },
      productDetails: {
         flexDirection: "row",
         justifyContent: "space-between",
         alignItems: "center",
      },
      productPrice: {
         fontSize: 16,
         color: theme.success,
         fontWeight: "600",
      },
      productStock: {
         fontSize: 14,
         color: theme.textSecondary,
      },

      // --- Modal Overlay ---
      modalOverlay: {
         // justifyContent: "flex-end",
      },

      // --- Bottom Sheet Container ---
      sheetContainer: {
         // borderRadius: 20,
         // paddingBottom: 32,
         // paddingTop: 12,
         // shadowColor: "#000",
         // shadowOffset: { width: 0, height: -4 },
         // shadowOpacity: 0.15,
         // shadowRadius: 12,
         // elevation: 20,
      },

      // --- Drag Handle ---
      dragHandle: {
         width: 36,
         height: 4,
         borderRadius: 2,
         backgroundColor: theme.isDark ? "#555" : "#D1D1D6",
         alignSelf: "center",
         marginBottom: 16,
      },

      // --- Sheet Header ---
      sheetHeader: {
         paddingHorizontal: 20,
         paddingBottom: 14,
         borderBottomWidth: StyleSheet.hairlineWidth,
         borderBottomColor: theme.isDark ? "#3D3D3F" : "#E5E5EA",
         marginBottom: 8,
      },
      sheetProductName: {
         fontSize: 16,
         fontWeight: "700",
         color: theme.textPrimary,
         marginBottom: 2,
      },
      sheetProductMeta: {
         fontSize: 13,
         color: theme.textSecondary,
      },

      // --- Menu Items ---
      menuItem: {
         flexDirection: "row",
         alignItems: "center",
         paddingVertical: 14,
         paddingHorizontal: 20,
         gap: 14,
      },
      menuItemPressed: {
         backgroundColor: theme.isDark ? "#3A3A3C" : "#F2F2F7",
      },
      menuItemIcon: {
         width: 36,
         height: 36,
         borderRadius: 10,
         justifyContent: "center",
         alignItems: "center",
      },
      menuItemLabel: {
         fontSize: 15,
         fontWeight: "500",
         color: theme.textPrimary,
      },
      menuItemSubLabel: {
         fontSize: 12,
         color: theme.textSecondary,
         marginTop: 1,
      },

      divider: {
         height: StyleSheet.hairlineWidth,
         backgroundColor: theme.isDark ? "#3D3D3F" : "#E5E5EA",
         marginHorizontal: 20,
         marginVertical: 4,
      },

      // --- Cancel Button ---
      cancelButton: {
         marginHorizontal: 16,
         marginTop: 12,
         paddingVertical: 15,
         borderRadius: 12,
         backgroundColor: theme.isDark ? "#3A3A3C" : "#F2F2F7",
         alignItems: "center",
      },
      cancelLabel: {
         fontSize: 16,
         fontWeight: "600",
         color: theme.isDark ? "#FF453A" : "#FF3B30",
      },
   });

   const menuActions = [
      {
         icon: "package-variant",
         iconBg: theme.isDark ? "#2C3E50" : "#EBF5FB",
         iconColor: "#3498DB",
         label: "Update Stock",
         subLabel: `Current stock: ${product.stock}`,
         onPress: () => {
            setMenuOpen(false);
            onUpdateStock(product);
         },
      },
      {
         icon: "cart-plus",
         iconBg: theme.isDark ? "#1E3A2F" : "#EAFAF1",
         iconColor: theme.success || "#27AE60",
         label: "Add to Transaction",
         subLabel: `₱${product.price.toFixed(2)} each`,
         onPress: () => {
            setMenuOpen(false);
            // handle add to transaction
         },
      },
   ];

   return (
      <>
         <View
            style={[styles.productCard, theme.isDark && styles.productCardDark]}
         >
            <View style={styles.productHeader}>
               <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productDetails}>
                     <Text style={styles.productPrice}>
                        ₱{product.price.toFixed(2)}
                     </Text>
                     <Text style={styles.productStock}>
                        Stock: {product.stock}
                     </Text>
                  </View>
               </View>
               <TouchableOpacity onPress={() => setMenuOpen(true)} hitSlop={8}>
                  <MaterialCommunityIcons
                     name="dots-vertical"
                     size={24}
                     color={theme.textPrimary}
                  />
               </TouchableOpacity>
            </View>
         </View>

         <Modal
            visible={menuOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setMenuOpen(false)}
         >
            {/* Tap outside to dismiss */}
            <Pressable
               style={styles.modalOverlay}
               onPress={() => setMenuOpen(false)}
            >
               <Pressable onPress={() => {}} style={styles.sheetContainer}>
                  {/* Drag Handle */}
                  <View style={styles.dragHandle} />

                  {/* Product Context Header */}
                  <View style={styles.sheetHeader}>
                     <Text style={styles.sheetProductName}>{product.name}</Text>
                     <Text style={styles.sheetProductMeta}>
                        ₱{product.price.toFixed(2)} · {product.stock} in stock
                     </Text>
                  </View>

                  {/* Actions */}
                  {menuActions.map((action, index) => (
                     <View key={action.label}>
                        {index > 0 && <View style={styles.divider} />}
                        <Pressable
                           style={({ pressed }) => [
                              styles.menuItem,
                              pressed && styles.menuItemPressed,
                           ]}
                           onPress={action.onPress}
                        >
                           <View
                              style={[
                                 styles.menuItemIcon,
                                 { backgroundColor: action.iconBg },
                              ]}
                           >
                              <MaterialCommunityIcons
                                 name={action.icon}
                                 size={20}
                                 color={action.iconColor}
                              />
                           </View>
                           <View>
                              <Text style={styles.menuItemLabel}>
                                 {action.label}
                              </Text>
                              <Text style={styles.menuItemSubLabel}>
                                 {action.subLabel}
                              </Text>
                           </View>
                        </Pressable>
                     </View>
                  ))}

                  {/* Cancel */}
                  <TouchableOpacity
                     style={styles.cancelButton}
                     onPress={() => setMenuOpen(false)}
                     activeOpacity={0.7}
                  >
                     <Text style={styles.cancelLabel}>Cancel</Text>
                  </TouchableOpacity>
               </Pressable>
            </Pressable>
         </Modal>
      </>
   );
}
