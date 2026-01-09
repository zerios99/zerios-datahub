import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart(),
    nitro(),
    tailwindcss(),
    devtools(),
    // react's vite plugin must come after start's vite plugin
    viteReact(),
  ],
  // Nitro config is required so the Nitro Vite plugin can register
  // the "nitro" environment used for SSR/dev
  nitro: {},
})

export default config
