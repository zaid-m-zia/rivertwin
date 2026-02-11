import { defineConfig } from 'vite'
import path from 'path'

// Minimal, stable Cesium config for Vite
export default defineConfig({
  define: {
    // runtime base used by Cesium to load static assets
    CESIUM_BASE_URL: JSON.stringify('/cesium')
  },
  resolve: {
    alias: {
      // point the `cesium` import to the Build output so imports like `import('cesium')`
      // resolve to the package build. No deep-path hacks.
      cesium: path.resolve(__dirname, 'node_modules/cesium/Build/Cesium')
    }
  }
})
