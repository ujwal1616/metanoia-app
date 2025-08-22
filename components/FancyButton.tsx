import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export default function FancyButton({ children, style, ...props }) {
  const { colors, font, radii } = useTheme();
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: colors.primary,
          borderRadius: radii.button,
          paddingVertical: 16,
          paddingHorizontal: 28,
          alignItems: "center",
          shadowColor: colors.shadow,
          shadowOpacity: 0.3,
          shadowRadius: 14,
          elevation: 4,
        },
        style,
      ]}
      activeOpacity={0.85}
      {...props}
    >
      <Text style={{
        color: "#fff",
        fontFamily: font.bold,
        fontSize: 18,
        letterSpacing: 0.5
      }}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}