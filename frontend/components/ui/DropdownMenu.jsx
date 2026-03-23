import {
   View,
   Text,
   TouchableOpacity,
   StyleSheet,
   TouchableWithoutFeedback,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeProvider";
import { useState, useRef, useEffect } from "react";

export default function DropdownMenu({ items = [], onClose }) {
   const { theme } = useTheme();
   const [isOpen, setIsOpen] = useState(false);
   const buttonRef = useRef(null);

   useEffect(() => {
      if (!isOpen && onClose) {
         onClose();
      }
   }, [isOpen]);

   const handleToggle = () => {
      setIsOpen(!isOpen);
   };

   const handleItemPress = (onPress) => {
      setIsOpen(false);
      onPress();
   };

   const styles = StyleSheet.create({
      container: {
         position: "relative",
      },
      menuButton: {
         padding: 4,
      },
      menuDropdown: {
         position: "absolute",
         right: 0,
         top: 32,
         backgroundColor: theme.background,
         borderRadius: 8,
         borderWidth: 1,
         borderColor: theme.border,
         minWidth: 150,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.2,
         shadowRadius: 4,
         elevation: 5,
         zIndex: 1000,
      },
      menuItem: {
         flexDirection: "row",
         alignItems: "center",
         paddingVertical: 12,
         paddingHorizontal: 16,
         gap: 12,
      },
      menuItemText: {
         fontSize: 14,
         color: theme.textPrimary,
      },
   });

   return (
      <View style={styles.container}>
         <TouchableOpacity
            ref={buttonRef}
            style={styles.menuButton}
            onPress={handleToggle}
         >
            <MaterialIcons
               name="more-vert"
               size={24}
               color={theme.textPrimary}
            />
         </TouchableOpacity>

         {isOpen && (
            <View style={styles.menuDropdown}>
               {items.map((item, index) => (
                  <TouchableOpacity
                     key={index}
                     style={styles.menuItem}
                     onPress={() => handleItemPress(item.onPress)}
                  >
                     <MaterialIcons
                        name={item.icon}
                        size={20}
                        color={theme.textPrimary}
                     />
                     <Text style={styles.menuItemText}>{item.label}</Text>
                  </TouchableOpacity>
               ))}
            </View>
         )}
      </View>
   );
}
