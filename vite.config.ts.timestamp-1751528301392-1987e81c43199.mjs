// vite.config.ts
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "file:///E:/Dokumenty/Projekty/icrpg-combat-manager/node_modules/vite/dist/node/index.js";
import vue from "file:///E:/Dokumenty/Projekty/icrpg-combat-manager/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import vueDevTools from "file:///E:/Dokumenty/Projekty/icrpg-combat-manager/node_modules/vite-plugin-vue-devtools/dist/vite.mjs";
import Components from "file:///E:/Dokumenty/Projekty/icrpg-combat-manager/node_modules/unplugin-vue-components/dist/vite.js";
import { PrimeVueResolver } from "file:///E:/Dokumenty/Projekty/icrpg-combat-manager/node_modules/unplugin-vue-components/dist/resolvers.js";
var __vite_injected_original_import_meta_url = "file:///E:/Dokumenty/Projekty/icrpg-combat-manager/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    Components({
      resolvers: [PrimeVueResolver()],
      dts: true
    })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  base: "/icrpgcm/"
  // Base path for subdirectory deployment
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFxEb2t1bWVudHlcXFxcUHJvamVrdHlcXFxcaWNycGctY29tYmF0LW1hbmFnZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXERva3VtZW50eVxcXFxQcm9qZWt0eVxcXFxpY3JwZy1jb21iYXQtbWFuYWdlclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovRG9rdW1lbnR5L1Byb2pla3R5L2ljcnBnLWNvbWJhdC1tYW5hZ2VyL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZmlsZVVSTFRvUGF0aCwgVVJMIH0gZnJvbSBcIm5vZGU6dXJsXCI7XG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgdnVlIGZyb20gXCJAdml0ZWpzL3BsdWdpbi12dWVcIjtcbmltcG9ydCB2dWVEZXZUb29scyBmcm9tIFwidml0ZS1wbHVnaW4tdnVlLWRldnRvb2xzXCI7XG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tIFwidW5wbHVnaW4tdnVlLWNvbXBvbmVudHMvdml0ZVwiO1xuaW1wb3J0IHsgUHJpbWVWdWVSZXNvbHZlciB9IGZyb20gXCJ1bnBsdWdpbi12dWUtY29tcG9uZW50cy9yZXNvbHZlcnNcIjtcblxuLy8gaHR0cHM6Ly92aXRlLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgdnVlKCksXG4gICAgdnVlRGV2VG9vbHMoKSxcbiAgICBDb21wb25lbnRzKHtcbiAgICAgIHJlc29sdmVyczogW1ByaW1lVnVlUmVzb2x2ZXIoKV0sXG4gICAgICBkdHM6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTChcIi4vc3JjXCIsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgIH0sXG4gIH0sXG4gIGJhc2U6IFwiL2ljcnBnY20vXCIsIC8vIEJhc2UgcGF0aCBmb3Igc3ViZGlyZWN0b3J5IGRlcGxveW1lbnRcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF3VCxTQUFTLGVBQWUsV0FBVztBQUUzVixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFNBQVM7QUFDaEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxnQkFBZ0I7QUFDdkIsU0FBUyx3QkFBd0I7QUFOa0ssSUFBTSwyQ0FBMkM7QUFTcFAsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLElBQ0osWUFBWTtBQUFBLElBQ1osV0FBVztBQUFBLE1BQ1QsV0FBVyxDQUFDLGlCQUFpQixDQUFDO0FBQUEsTUFDOUIsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxNQUFNO0FBQUE7QUFDUixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
