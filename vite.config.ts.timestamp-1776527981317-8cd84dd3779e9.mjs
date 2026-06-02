// vite.config.ts
import { defineConfig, loadEnv } from "file:///sessions/nifty-gifted-cori/mnt/Villa-Luar/node_modules/vite/dist/node/index.js";
import react from "file:///sessions/nifty-gifted-cori/mnt/Villa-Luar/node_modules/@vitejs/plugin-react/dist/index.js";
import path from "path";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react()],
    publicDir: "public",
    // Explicitly define public directory
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./")
      }
    },
    define: {
      "process.env": {
        API_KEY: JSON.stringify(env.API_KEY)
      }
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false,
      // Increase chunk size limit to avoid warnings when bundling large JSON/base64 content
      chunkSizeWarningLimit: 5e3
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvc2Vzc2lvbnMvbmlmdHktZ2lmdGVkLWNvcmkvbW50L1ZpbGxhLUx1YXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9zZXNzaW9ucy9uaWZ0eS1naWZ0ZWQtY29yaS9tbnQvVmlsbGEtTHVhci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vc2Vzc2lvbnMvbmlmdHktZ2lmdGVkLWNvcmkvbW50L1ZpbGxhLUx1YXIvdml0ZS5jb25maWcudHNcIjtcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICAvLyBMb2FkIGVudiBmaWxlIGJhc2VkIG9uIGBtb2RlYCBpbiB0aGUgY3VycmVudCB3b3JraW5nIGRpcmVjdG9yeS5cbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCAocHJvY2VzcyBhcyBhbnkpLmN3ZCgpLCAnJyk7XG5cbiAgcmV0dXJuIHtcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgcHVibGljRGlyOiAncHVibGljJywgLy8gRXhwbGljaXRseSBkZWZpbmUgcHVibGljIGRpcmVjdG9yeVxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogcGF0aC5yZXNvbHZlKChwcm9jZXNzIGFzIGFueSkuY3dkKCksICcuLycpLFxuICAgICAgfSxcbiAgICB9LFxuICAgIGRlZmluZToge1xuICAgICAgJ3Byb2Nlc3MuZW52Jzoge1xuICAgICAgICBBUElfS0VZOiBKU09OLnN0cmluZ2lmeShlbnYuQVBJX0tFWSlcbiAgICAgIH1cbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6ICdkaXN0JyxcbiAgICAgIGFzc2V0c0RpcjogJ2Fzc2V0cycsXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxuICAgICAgLy8gSW5jcmVhc2UgY2h1bmsgc2l6ZSBsaW1pdCB0byBhdm9pZCB3YXJuaW5ncyB3aGVuIGJ1bmRsaW5nIGxhcmdlIEpTT04vYmFzZTY0IGNvbnRlbnRcbiAgICAgIGNodW5rU2l6ZVdhcm5pbmdMaW1pdDogNTAwMCwgXG4gICAgfVxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxjQUFjLGVBQWU7QUFDdEMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUdqQixJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUV4QyxRQUFNLE1BQU0sUUFBUSxNQUFPLFFBQWdCLElBQUksR0FBRyxFQUFFO0FBRXBELFNBQU87QUFBQSxJQUNMLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxJQUNqQixXQUFXO0FBQUE7QUFBQSxJQUNYLFNBQVM7QUFBQSxNQUNQLE9BQU87QUFBQSxRQUNMLEtBQUssS0FBSyxRQUFTLFFBQWdCLElBQUksR0FBRyxJQUFJO0FBQUEsTUFDaEQ7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixlQUFlO0FBQUEsUUFDYixTQUFTLEtBQUssVUFBVSxJQUFJLE9BQU87QUFBQSxNQUNyQztBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxNQUNSLFdBQVc7QUFBQSxNQUNYLFdBQVc7QUFBQTtBQUFBLE1BRVgsdUJBQXVCO0FBQUEsSUFDekI7QUFBQSxFQUNGO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
