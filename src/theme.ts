import { extendTheme, type ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme({
  config,
  semanticTokens: {
    colors: {
      sideBar: { default: "#55565A", _dark: "#55565A" },
    },
  },
  fonts: {
    heading: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif`,
    body: `Inter, system-ui, Avenir, Helvetica, Arial, sans-serif`,
    mono: `"JetBrains Mono", Menlo, monospace`,
  },
  colors: {
    accent: {
      50: "#ecf6f8",
      100: "#cfeaee",
      500: "#5AAFBA",
      600: "#4c98a2",
      700: "#3c7b84",
    },
    surface: {
      900: "#2D3748",
      800: "#3a4555",
    },
  },
  styles: {
    global: {
      "html, body, #root": { height: "100%", margin: 0, padding: 0 },
      body: { bg: "#2D3748", color: "white" },
      "::selection": { bg: "rgba(90,175,186,0.35)" },
    },
  },
});
