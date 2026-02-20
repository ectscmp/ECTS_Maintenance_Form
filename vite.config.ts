import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("@mui")) return "mui"; // separate MUI
            if (id.includes("jspdf")) return "jspdf"; // separate PDF lib
            if (id.includes("zod")) return "zod";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1500, // optional: increase warning limit
  },
});
