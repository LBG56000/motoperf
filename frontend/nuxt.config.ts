// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiback: 'http://localhost:5000/api/v1/',
      appName: 'MotoCenter',
      apiBase: process.env.NUXT_PUBLIC_API_URL
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
