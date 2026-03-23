import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Modal, FormField, Input, Dropdown, Body, Caption } from "./ui";
import { useTheme } from "./ThemeProvider";
import Button from "./ui/Button";

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
         backgroundColor: theme.bg2,
         borderWidth: 1,
         borderColor: theme.border,
         borderRadius: 8,
         padding: 12,
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
                  variant="secondary"
                  onPress={onCancel}
                  style={{ flex: 1 }}
               />
               <Button
                  title="Update"
                  variant="success"
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
               style={{
                  width: 250,
               }}
            />
         </FormField>
      </Modal>
   );
}
