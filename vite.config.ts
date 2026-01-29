import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Target modern browsers to reduce legacy JS polyfills
    target: ["es2020", "edge88", "firefox78", "chrome87", "safari14"],
    // Enable code splitting
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React ecosystem - loaded on every page
          if (id.includes("node_modules/react/") || 
              id.includes("node_modules/react-dom/") || 
              id.includes("node_modules/react-router")) {
            return "react-core";
          }
          // Framer Motion - used for animations
          if (id.includes("node_modules/framer-motion")) {
            return "framer";
          }
          // Radix UI components - UI library
          if (id.includes("node_modules/@radix-ui")) {
            return "radix-ui";
          }
          // TanStack Query - data fetching
          if (id.includes("node_modules/@tanstack")) {
            return "tanstack";
          }
          // Supabase - backend
          if (id.includes("node_modules/@supabase")) {
            return "supabase";
          }
          // Charts - admin only (recharts)
          if (id.includes("node_modules/recharts") || 
              id.includes("node_modules/d3-")) {
            return "charts";
          }
          // Editor - admin only (tiptap)
          if (id.includes("node_modules/@tiptap") || 
              id.includes("node_modules/prosemirror")) {
            return "editor";
          }
          // Diagrams - admin only (mermaid)
          if (id.includes("node_modules/mermaid")) {
            return "mermaid";
          }
          // Export utilities - admin only
          if (id.includes("node_modules/exceljs") || 
              id.includes("node_modules/jspdf") ||
              id.includes("node_modules/jszip")) {
            return "export-utils";
          }
          // Date utilities
          if (id.includes("node_modules/date-fns")) {
            return "date-utils";
          }
          // Other vendor modules
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
}));
