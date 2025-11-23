import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Custom plugin to copy villa-content.json from root to dist
const copyContentPlugin = () => {
  return {
    name: 'copy-content',
    writeBundle() {
      const srcPath = path.resolve('villa-content.json');
      const destPath = path.resolve('dist/villa-content.json');
      if (fs.existsSync(srcPath)) {
        // Ensure dist exists (it should after build)
        if (!fs.existsSync(path.dirname(destPath))) {
           fs.mkdirSync(path.dirname(destPath), { recursive: true });
        }
        fs.copyFileSync(srcPath, destPath);
        console.log('✓ Copied villa-content.json to build output');
      }
    }
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(), '');

  return {
    plugins: [react(), copyContentPlugin()],
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