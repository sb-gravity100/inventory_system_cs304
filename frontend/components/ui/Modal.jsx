import { View, Modal as RNModal, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTheme } from "../ThemeProvider";
import { Font, FontSize, Spacing, Radius } from "../../constants/colors";

export default function Modal({ visible, onClose, title, children, actions, modalStyle }) {
  const { theme } = useTheme();

  const s = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      backgroundColor: theme.surface,
      borderRadius: Radius.modal,
      padding: Spacing.xl,
      width: "90%",
      maxWidth: 400,
    },
    title: {
      fontFamily: Font.bold,
      fontSize: FontSize.screenTitle,
      color: theme.textPrimary,
      marginBottom: Spacing.lg,
    },
    actions: {
      flexDirection: "row",
      gap: Spacing.md,
      marginTop: Spacing.lg,
    },
  });

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={[s.content, modalStyle]}>
            {title && <Text style={s.title}>{title}</Text>}
            {children}
            {actions && <View style={s.actions}>{actions}</View>}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}
