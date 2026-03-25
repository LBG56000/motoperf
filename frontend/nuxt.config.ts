// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      appName: 'MotoCenter',
      apiBase:
        process.env.NUXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1/'
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
