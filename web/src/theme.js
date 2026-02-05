import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      terracotta: "#C6856D",
      terracottaDark: "#B4745F",
      sage: "#BFD9C9",
      sageLight: "#DDECE4",
      peach: "#F2D1C2",
      cream: "#F7F1EA",
      ink: "#0F172A",
      muted: "#475569",
      border: "#E7E0DA",
    },
  },
  styles: {
    global: {
      body: {
        bg: "white",
        color: "brand.ink",
      },
    },
  },
});

export default theme;
