import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: { port: 3000, host: "0.0.0.0" },
  plugins: [tsConfigPaths(), tanstackStart(), tailwindcss(), viteReact()],
  optimizeDeps: {
    exclude: [
      "react-native",
      "@expo/*",
      "expo",
      "expo-*",
      "@better-auth/expo",
      "nativewind",
      "react-native-*",
    ],
  },
  define: {
    // Prevent React Native from being processed
    "process.env.REACT_NATIVE": JSON.stringify(undefined),
  },
});
