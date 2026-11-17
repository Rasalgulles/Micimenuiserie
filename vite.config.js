import { defineConfig } from 'vite'
import { fileURLToPath } from 'node:url'
import { renderHead, renderBody } from './src/template.js'
import { legalPages } from './src/legal.js'

// PREVIEW=1 : version d'aperçu (bibliothèques et polices chargées depuis des CDN publics)
const preview = process.env.PREVIEW === '1'
// CONFIG=clients/xxx.config.js : construire le site d'un autre client
const configPath = fileURLToPath(new URL(process.env.CONFIG || './site.config.js', import.meta.url))
const { default: config } = await import(configPath)
const CDN = {
  three: 'https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js',
  'three/examples/jsm/': 'https://cdn.jsdelivr.net/npm/three@0.187.0/examples/jsm/',
  gsap: 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/index.js',
  'gsap/ScrollTrigger': 'https://cdn.jsdelivr.net/npm/gsap@3.15.1/ScrollTrigger.js',
  lenis: 'https://cdn.jsdelivr.net/npm/lenis@1.3.27/dist/lenis.mjs',
}
const previewHead = `<script type="importmap">${JSON.stringify({ imports: CDN })}</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=IBM+Plex+Mono:wght@400;500&display=swap">`

export default defineConfig({
  base: preview ? './' : '/',
  resolve: {
    alias: [
      { find: '@config', replacement: configPath },
      ...(preview ? [{ find: './fonts.css', replacement: fileURLToPath(new URL('./src/empty.css', import.meta.url)) }] : []),
    ],
  },
  plugins: [
    {
      name: 'charabia-template',
      transformIndexHtml(html) {
        return html
          .replace('<!--HEAD-->', (preview ? previewHead : '') + renderHead(config))
          .replace('<!--BODY-->', renderBody(config))
      },
      generateBundle() {
        for (const [fileName, source] of Object.entries(legalPages(config))) this.emitFile({ type: 'asset', fileName, source })
      },
    },
  ],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    outDir: process.env.OUT || (preview ? 'dist-preview' : 'dist'),
    rollupOptions: preview
      ? { external: ['three', /^three\//, 'gsap', /^gsap\//, 'lenis'], output: { inlineDynamicImports: process.env.SINGLE === '1' } }
      : {},
  },
})
