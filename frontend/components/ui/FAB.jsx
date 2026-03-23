import {
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  Text,
  Pressable,
} from "react-native";
import { useRef, useState } from "react";
import { useTheme } from "../ThemeProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

export default function FAB({ actions = [] }) {
  const { theme } = useTheme();
  const [fabOpen, setFabOpen] = useState(false);
  const isSingle = actions.length === 1;

  const itemAnims = useRef(actions.map(() => new Animated.Value(0))).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const isOpenRef = useRef(false);

  const open = () => {
    if (isSingle) {
      actions[0].onPress();
      return;
    }
    if (isAnimating.current) return;
    isAnimating.current = true;
    isOpenRef.current = true;
    setFabOpen(true);
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.stagger(
        55,
        itemAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          })
        )
      ),
    ]).start(() => {
      isAnimating.current = false;
    });
  };

  const close = (callback) => {
    isAnimating.current = true;
    isOpenRef.current = false;
    // Fire action immediately — no waiting for animation
    callback?.();
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: 0,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.stagger(
        30,
        [...itemAnims].reverse().map((anim) =>
          Animated.timing(anim, {
            toValue: 0,
            duration: 120,
            useNativeDriver: true,
          })
        )
      ),
    ]).start(() => {
      isAnimating.current = false;
      setFabOpen(false);
    });
  };

  const iconRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  });

  const s = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
    },
    actionsContainer: {
      position: "absolute",
      bottom: 84,
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

  const handleFabPress = () => {
    if (isSingle) {
      open();
    } else if (isOpenRef.current) {
      close();
    } else {
      open();
    }
  };

  return (
    <>
      {fabOpen && <Pressable style={s.backdrop} onPress={() => close()} />}

      <View
        style={s.actionsContainer}
        pointerEvents={fabOpen ? "box-none" : "none"}
      >
        {actions.map((action, index) => {
          const anim = itemAnims[index];
          const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
          const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });
          const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

          return (
            <Animated.View
              key={action.label}
              style={[s.actionRow, { opacity, transform: [{ translateY }, { scale }] }]}
            >
              <View style={s.label}>
                <Text style={s.labelText}>{action.label}</Text>
              </View>
              <TouchableOpacity
                style={s.actionBtn}
                onPress={() => close(action.onPress)}
                activeOpacity={0.75}
              >
                <MaterialIcons name={action.icon} size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      <TouchableOpacity style={s.fab} onPress={handleFabPress} activeOpacity={0.85}>
        <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
          <MaterialIcons name="add" size={26} color="#ffffff" />
        </Animated.View>
      </TouchableOpacity>
    </>
  );
}
