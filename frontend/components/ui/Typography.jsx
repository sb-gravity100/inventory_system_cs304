import { Text } from "react-native";
import { useTheme } from "../ThemeProvider";
import { Font, FontSize } from "../../constants/colors";

export function Title({ children, style, align = "left", ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: Font.bold,
          fontSize: FontSize.screenTitle,
          color: theme.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Subtitle({ children, style, align = "left", ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: Font.semiBold,
          fontSize: FontSize.listPrimary,
          color: theme.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Body({ children, style, align = "left", ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: Font.regular,
          fontSize: FontSize.body,
          color: theme.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Caption({ children, style, align = "left", ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: Font.regular,
          fontSize: FontSize.listSecondary,
          color: theme.textSecondary,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

export function Label({ children, style, align = "left", ...props }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontFamily: Font.medium,
          fontSize: FontSize.body,
          color: theme.textPrimary,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}
