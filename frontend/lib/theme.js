"use client";
import { createTheme } from "@mui/material/styles";

// Design tokens — grounded in the trade: work orders, blueprints, site paint
// tins and safety-signal colour, not a generic SaaS palette.
export const tokens = {
  ink: "#1C2321", // near-black, slightly oxidised
  paper: "#EDE8DE", // limewashed concrete, not the generic cream
  paperAlt: "#E2DCCC",
  rust: "#B3491A", // oxide / safety-signal accent
  rustDark: "#8F3814",
  steel: "#33505F", // work-uniform / wiring blue
  steelLight: "#4C7080",
  olive: "#4B6B4C", // completed / success
  line: "#C9C2B4", // aged concrete rule
  white: "#FBFAF6",
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: tokens.rust, dark: tokens.rustDark, contrastText: tokens.white },
    secondary: { main: tokens.steel, light: tokens.steelLight, contrastText: tokens.white },
    success: { main: tokens.olive },
    background: { default: tokens.paper, paper: tokens.white },
    text: { primary: tokens.ink, secondary: "#4A4740" },
    divider: tokens.line,
  },
  typography: {
    fontFamily: "var(--font-body)",
    h1: { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.05 },
    h2: { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.1 },
    h3: { fontFamily: "var(--font-display)", fontWeight: 700, letterSpacing: "-0.005em", lineHeight: 1.15 },
    h4: { fontFamily: "var(--font-display)", fontWeight: 700 },
    h5: { fontFamily: "var(--font-display)", fontWeight: 700 },
    h6: { fontFamily: "var(--font-display)", fontWeight: 700 },
    button: { fontFamily: "var(--font-display)", fontWeight: 700, textTransform: "none", letterSpacing: 0 },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 2, paddingInline: "1.4rem", paddingBlock: "0.7rem" },
        contained: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 2, fontFamily: "var(--font-body)", fontWeight: 600 },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined" },
    },
  },
});

export default theme;
