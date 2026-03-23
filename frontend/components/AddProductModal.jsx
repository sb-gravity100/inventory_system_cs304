import { Modal, FormField, Input, Button } from "./ui";

export default function AddProductModal({
   visible,
   newProductName,
   setNewProductName,
   newProductPrice,
   setNewProductPrice,
   newProductStock,
   setNewProductStock,
   onCancel,
   onSave,
}) {
   return (
      <Modal
         visible={visible}
         onClose={onCancel}
         title="Add New Product"
         actions={
            <>
               <Button
                  title="Cancel"
                  variant="secondary"
                  onPress={onCancel}
                  style={{ flex: 1 }}
               />
               <Button
                  title="Add Product"
                  variant="success"
                  onPress={onSave}
                  style={{ flex: 1 }}
               />
            </>
         }
      >
         <FormField label="Product Name">
            <Input
               placeholder="Enter product name"
               value={newProductName}
               onChangeText={setNewProductName}
               style={{
                  width: 250,
               }}
            />
         </FormField>

         <FormField label="Price">
            <Input
               placeholder="0.00"
               value={newProductPrice}
               onChangeText={setNewProductPrice}
               keyboardType="decimal-pad"
            />
         </FormField>

         <FormField label="Initial Stock">
            <Input
               placeholder="0"
               value={newProductStock}
               onChangeText={setNewProductStock}
               keyboardType="number-pad"
            />
         </FormField>
      </Modal>
   );
}
