// colors.js

// ── Light theme ──────────────────────────────────────────────────────────────
export const LightColors = {
  background: "#fafafa",
  surface: "#ffffff",
  primary: "#1a2235",
  currency: "#16a34a",
  statBlue: { bg: "#dbeafe", text: "#1d4ed8" },
  statGreen: { bg: "#dcfce7", text: "#15803d" },
  statNeutral: { bg: "#f3f4f6", text: "#374151" },
  border: "#e5e7eb",
  textPrimary: "#111827",
  textSecondary: "#6b7280",
  danger: "#dc2626",
  warning: "#d97706",
  statusCompleted: "#16a34a",
  statusPending: "#d97706",
  statusCancelled: "#6b7280",
  // legacy aliases kept for backward compat during UI migration
  secondary: "#3a5d63",
  accent: "#30343f",
  success: "#16a34a",
  error: "#dc2626",
  bg2: "#f3f4f6",
  card: "#ffffff",
  gray: "#6b7280",
};

// ── Dark theme ────────────────────────────────────────────────────────────────
export const DarkColors = {
  background: "#0f172a",
  surface: "#1e293b",
  primary: "#0f172a",
  currency: "#34d399",
  statBlue: { bg: "#1e3a5f", text: "#93c5fd" },
  statGreen: { bg: "#14532d", text: "#86efac" },
  statNeutral: { bg: "#1f2937", text: "#d1d5db" },
  border: "#374151",
  textPrimary: "#f1f5f9",
  textSecondary: "#94a3b8",
  danger: "#f87171",
  warning: "#fbbf24",
  statusCompleted: "#34d399",
  statusPending: "#fbbf24",
  statusCancelled: "#94a3b8",
  // legacy aliases
  secondary: "#1D201F",
  accent: "#d3d3d3",
  success: "#34d399",
  error: "#f87171",
  bg2: "#1f2937",
  card: "#1e293b",
  gray: "#94a3b8",
};

// ── Spacing ───────────────────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  screenPadding: 12,
  cardPadding: 12,
  listGap: 8,
  sectionGap: 16,
};

// ── Border radius ─────────────────────────────────────────────────────────────
export const Radius = {
  card: 6,
  button: 4,
  input: 4,
  modal: 8,
};

// ── Typography ────────────────────────────────────────────────────────────────
export const Font = {
  thin: "Outfit-Thin",
  extraLight: "Outfit-ExtraLight",
  light: "Outfit-Light",
  regular: "Outfit-Regular",
  medium: "Outfit-Medium",
  semiBold: "Outfit-SemiBold",
  bold: "Outfit-Bold",
  extraBold: "Outfit-ExtraBold",
  black: "Outfit-Black",
};

export const FontSize = {
  screenTitle: 24,
  sectionLabel: 13,
  body: 14,
  listPrimary: 15,
  listSecondary: 13,
  statValue: 20,
  button: 14,
};
