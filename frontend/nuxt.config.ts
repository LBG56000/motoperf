// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5000/api/v1/',
      appName: 'MotoCenter'
    }
  },

  modules: ['@nuxt/eslint', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  icon: {
    provider: 'server',
    serverBundle: {
      collections: ['lucide']
    }
  },
  eslint: {}
})
