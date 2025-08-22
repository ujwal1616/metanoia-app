import React from "react";
import { TextInput } from "react-native";
import { useTheme } from "../theme/ThemeProvider";

export default function FancyInput(props) {
  const { colors, font, radii } = useTheme();
  return (
    <TextInput
      style={{
        backgroundColor: colors.inputBackground,
        borderRadius: radii.input,
        padding: 16,
        fontFamily: font.regular,
        fontSize: 16,
        color: colors.text,
        marginBottom: 16,
        borderWidth: 1.5,
        borderColor: colors.border,
      }}
      placeholderTextColor={colors.subtext}
      {...props}
    />
  );
}