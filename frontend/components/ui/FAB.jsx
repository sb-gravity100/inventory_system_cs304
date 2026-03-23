import { TouchableOpacity, View, Animated, StyleSheet, Text, Pressable } from "react-native";
import { useRef, useState } from "react";
import { useTheme } from "../ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

export default function FAB({ actions = [] }) {
  const { theme } = useTheme();
  const [fabOpen, setFabOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toValue = fabOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 6,
      useNativeDriver: true,
    }).start();
    setFabOpen((v) => !v);
  };

  const close = () => {
    Animated.spring(animation, {
      toValue: 0,
      friction: 6,
      useNativeDriver: true,
    }).start(() => setFabOpen(false));
  };

  const iconRotate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const s = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    actionsContainer: {
      position: "absolute",
      bottom: 80,
      right: Spacing.lg,
      alignItems: "flex-end",
      gap: Spacing.sm,
    },
    actionRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.sm,
    },
    label: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderRadius: Radius.button,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 2,
    },
    labelText: {
      fontFamily: Font.medium,
      fontSize: FontSize.body,
      color: theme.textPrimary,
    },
    actionBtn: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    fab: {
      position: "absolute",
      bottom: Spacing.lg,
      right: Spacing.lg,
      backgroundColor: theme.primary,
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
  });

  return (
    <>
      {/* Tap-outside backdrop */}
      {fabOpen && (
        <Pressable style={s.backdrop} onPress={close} />
      )}

      {/* Action items */}
      {fabOpen && (
        <View style={s.actionsContainer} pointerEvents="box-none">
          {actions.map((action, index) => {
            const delay = index * 30;
            const translateY = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            });
            const opacity = animation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1],
            });

            return (
              <Animated.View
                key={action.label}
                style={[s.actionRow, { opacity, transform: [{ translateY }] }]}
              >
                <View style={s.label}>
                  <Text style={s.labelText}>{action.label}</Text>
                </View>
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={() => {
                    close();
                    action.onPress();
                  }}
                  activeOpacity={0.75}
                >
                  <MaterialIcons
                    name={action.icon}
                    size={22}
                    color={theme.textPrimary}
                  />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity style={s.fab} onPress={toggle} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
          <MaterialIcons name="add" size={26} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}
