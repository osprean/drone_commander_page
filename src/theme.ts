import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  fonts: {
    heading: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    body: `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`,
    mono: `"JetBrains Mono", "Menlo", monospace`,
  },
  colors: {
    accent: {
      50: "#e6fff9",
      100: "#b3ffec",
      500: "#00e8cc",
      700: "#00a891",
    },
  },
  styles: {
    global: {
      "html, body, #root": { height: "100%" },
      body: { bg: "#0a0e14", color: "#d8d8d8" },
    },
  },
});
