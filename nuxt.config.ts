import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: 'zh-Hant-TW',
      },
      title: 'Text-Search-Tool',
      viewport: 'width=device-width,initial-scale=1',
      link: [{ rel: 'icon', href: '/logo.svg' }],
      meta: [
        { name: 'description', content: 'text-search-tool' },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    public: {
      mapsKey: process.env.NUXT_GOOGLE_MAPS_API_KEY,
    },
  },
  css: ['~/assets/main.css'],
  devtools: { enabled: true },
  compatibilityDate: '2025-03-25',
});
