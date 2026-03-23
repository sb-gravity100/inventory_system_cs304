import {
   View,
   Modal as RNModal,
   StyleSheet,
   TouchableOpacity,
} from "react-native";
import { useTheme } from "../ThemeProvider";
import { Title } from "./Typography";
import Button from "./Button";

export default function Modal({
   visible,
   onClose,
   title,
   children,
   actions,
   modalStyle,
}) {
   const { theme } = useTheme();

   const styles = StyleSheet.create({
      overlay: {
         flex: 1,
         backgroundColor: "rgba(0, 0, 0, 0.5)",
         justifyContent: "center",
         alignItems: "center",
      },
      content: {
         backgroundColor: theme.background,
         borderRadius: 12,
         padding: 24,
      },
      header: {
         marginBottom: 20,
      },
      actions: {
         flexDirection: "row",
         gap: 12,
         marginTop: 20,
      },
   });

   return (
      <RNModal
         visible={visible}
         transparent
         animationType="fade"
         onRequestClose={onClose}
      >
         <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={onClose}
         >
            <TouchableOpacity
               activeOpacity={1}
               onPress={(e) => e.stopPropagation()}
            >
               <View style={[styles.content, modalStyle]}>
                  {title && (
                     <View style={styles.header}>
                        <Title>{title}</Title>
                     </View>
                  )}
                  {children}
                  {actions && <View style={styles.actions}>{actions}</View>}
               </View>
            </TouchableOpacity>
         </TouchableOpacity>
      </RNModal>
   );
}
