import { View, StyleSheet } from "react-native";
import { Modal, FormField, Input, Dropdown, Body, Caption } from "./ui";
import { useTheme } from "./ThemeProvider";
import Button from "./ui/Button";
import { Spacing, Radius } from "../constants/colors";

export default function UpdateStockModal({
   visible,
   selectedProduct,
   stockAction,
   setStockAction,
   stockQuantity,
   setStockQuantity,
   onCancel,
   onSave,
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      productDisplay: {
         backgroundColor: theme.background,
         borderWidth: 1,
         borderColor: theme.border,
         borderRadius: Radius.card,
         padding: Spacing.cardPadding,
      },
   });

   return (
      <Modal
         visible={visible}
         onClose={onCancel}
         title="Update Stock"
         actions={
            <>
               <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onCancel}
                  style={{ flex: 1 }}
               />
               <Button
                  title="Update"
                  variant="primary"
                  onPress={onSave}
                  style={{ flex: 1 }}
               />
            </>
         }
      >
         {selectedProduct && (
            <FormField label="Product">
               <View style={styles.productDisplay}>
                  <Body style={{ marginBottom: 4 }}>
                     {selectedProduct.name}
                  </Body>
                  <Caption>Current Stock: {selectedProduct.stock}</Caption>
               </View>
            </FormField>
         )}

         <FormField label="Action">
            <Dropdown
               options={["add", "set"]}
               value={stockAction}
               onChange={setStockAction}
            />
         </FormField>

         <FormField label="Quantity">
            <Input
               placeholder="Enter quantity"
               value={stockQuantity}
               onChangeText={setStockQuantity}
               keyboardType="number-pad"
            />
         </FormField>
      </Modal>
   );
}
