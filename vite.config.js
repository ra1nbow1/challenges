import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react"],
          "prop-types": ["prop-types"],
          "codemirror-python": ["@codemirror/lang-python"],
          "react-codemirror": ["@uiw/react-codemirror"],
          "axios": ["axios"],
      }
    },
  },
  chunkSizeWarningLimit: 500
}
})
