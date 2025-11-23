import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use a safer way to get CWD if needed, or just rely on default behavior
  // For basic env loading, strict CWD isn't always required, but here is the safe pattern:
  // Fix: Cast process to any to avoid "Property 'cwd' does not exist on type 'Process'" error when node types are missing
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      'process.env': {
        API_KEY: JSON.stringify(env.API_KEY)
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
    }
  };
});