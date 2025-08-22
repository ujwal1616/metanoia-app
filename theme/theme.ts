// This uses a rich, warm gold (not pale), with a clean white background
export const lightTheme = {
  colors: {
    background: "#FFFFFF",         // Crisp white
    card: "#FAF7F2",               // Warm off-white for cards
    primary: "#B88908",            // Rich, warm gold
    accent: "#FFD700",             // Accent gold (classic gold)
    text: "#232323",               // Deep black for readability
    subtext: "#8C8C8C",            // Muted gray for hints
    border: "#E7C873",             // Soft gold border
    inputBackground: "#FFF9EC",    // Pale gold/white for inputs
    success: "#8DC97F",
    error: "#E57373",
    shadow: "#FFD70033",           // Gold shadow with transparency
  },
  font: {
    regular: "Figtree-Regular",
    bold: "Figtree-Bold",
    semiBold: "Figtree-SemiBold",
  },
  radii: {
    card: 24,
    button: 20,
    input: 14,
  },
  spacing: {
    xs: 6,
    sm: 12,
    md: 20,
    lg: 32,
    xl: 48,
  }
};

export const darkTheme = {
  colors: {
    background: "#181818",         // Deep charcoal
    card: "#232323",               // Slightly lighter for cards
    primary: "#FFD700",            // Classic gold that pops in dark
    accent: "#B88908",             // Deep gold accent
    text: "#FFF9F0",               // Warm white
    subtext: "#C4B998",            // Muted gold-gray
    border: "#FFD700",
    inputBackground: "#232015",    // Muted gold-tinted dark
    success: "#8DC97F",
    error: "#E57373",
    shadow: "#FFD70044",           // Gold shadow with transparency
  },
  font: lightTheme.font,
  radii: lightTheme.radii,
  spacing: lightTheme.spacing,
};