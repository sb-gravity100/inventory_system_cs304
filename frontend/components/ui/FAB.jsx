import { TouchableOpacity, View, Animated, StyleSheet } from "react-native";
import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { Text } from "react-native";

export default function FAB({ actions = [] }) {
   const { theme } = useTheme();
   const [fabOpen, setFabOpen] = useState(false);
   const [fabAnimation] = useState(new Animated.Value(0));

   const toggleFab = () => {
      const toValue = fabOpen ? 0 : 1;
      Animated.spring(fabAnimation, {
         toValue,
         friction: 5,
         useNativeDriver: true,
      }).start();
      setFabOpen(!fabOpen);
   };

   const styles = StyleSheet.create({
      fab: {
         position: "absolute",
         bottom: 20,
         right: 20,
         backgroundColor: theme.primary,
         width: 56,
         height: 56,
         borderRadius: 28,
         alignItems: "center",
         justifyContent: "center",
         elevation: 6,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 4 },
         shadowOpacity: 0.3,
         shadowRadius: 4,
      },
      fabActions: {
         position: "absolute",
         bottom: 90,
         right: 20,
         gap: 12,
      },
      fabAction: {
         flexDirection: "row",
         alignItems: "center",
         justifyContent: "flex-end",
         gap: 12,
      },
      fabActionButton: {
         backgroundColor: theme.secondary,
         width: 48,
         height: 48,
         borderRadius: 24,
         alignItems: "center",
         justifyContent: "center",
         elevation: 4,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 2 },
         shadowOpacity: 0.2,
         shadowRadius: 2,
      },
      fabActionLabel: {
         backgroundColor: theme.secondary,
         paddingHorizontal: 12,
         paddingVertical: 6,
         borderRadius: 4,
         elevation: 2,
         shadowColor: "#000",
         shadowOffset: { width: 0, height: 1 },
         shadowOpacity: 0.2,
         shadowRadius: 1,
      },
      fabActionLabelDark: {
         backgroundColor: "#3A3A3A",
      },
      fabActionText: {
         fontSize: 14,
         color: theme.textPrimary,
         fontWeight: "600",
      },
   });

   return (
      <>
         {fabOpen && (
            <View style={styles.fabActions}>
               {actions.map((action, index) => {
                  const translateY = fabAnimation.interpolate({
                     inputRange: [0, 1],
                     outputRange: [50, 0],
                  });
                  const opacity = fabAnimation.interpolate({
                     inputRange: [0, 1],
                     outputRange: [0, 1],
                  });

                  return (
                     <Animated.View
                        key={index}
                        style={[
                           styles.fabAction,
                           {
                              transform: [{ translateY }],
                              opacity,
                           },
                        ]}
                     >
                        <View style={styles.fabActionLabel}>
                           <Text style={styles.fabActionText}>
                              {action.label}
                           </Text>
                        </View>
                        <TouchableOpacity
                           style={styles.fabActionButton}
                           onPress={() => {
                              setFabOpen(false);
                              action.onPress();
                           }}
                        >
                           <MaterialIcons
                              name={action.icon}
                              size={24}
                              color={theme.textPrimary}
                           />
                        </TouchableOpacity>
                     </Animated.View>
                  );
               })}
            </View>
         )}

         <TouchableOpacity style={styles.fab} onPress={toggleFab}>
            <Animated.View
               style={{
                  transform: [
                     {
                        rotate: fabAnimation.interpolate({
                           inputRange: [0, 1],
                           outputRange: ["0deg", "45deg"],
                        }),
                     },
                  ],
               }}
            >
               <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </Animated.View>
         </TouchableOpacity>
      </>
   );
}
