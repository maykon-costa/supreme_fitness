import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

// LP_GUIDE §6 — code splitting
export default defineConfig({
  // GitHub Pages de projeto serve em /<repo>/, então os assets precisam desse
  // prefixo. O workflow define VITE_BASE; com domínio próprio (public/CNAME)
  // ele passa "/" e nada muda. Local continua em "/".
  base: process.env.VITE_BASE || "/",

  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  build: {
    rollupOptions: {
      output: {
        // Vite 8 roda em Rolldown: manualChunks SÓ aceita função.
        // O formato objeto do LP_GUIDE §6 quebra o build aqui.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return "three";
          if (/[\\/]node_modules[\\/](gsap|@gsap)[\\/]/.test(id)) return "gsap";
          if (/[\\/]node_modules[\\/]motion/.test(id)) return "motion";
          if (/[\\/]node_modules[\\/]animejs[\\/]/.test(id)) return "anime";
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
            return "vendor";
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
