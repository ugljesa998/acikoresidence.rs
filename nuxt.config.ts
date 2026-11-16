// https://nuxt.com/docs/api/configuration/nuxt-config
import { site } from './app/data/site'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxt/fonts', '@nuxt/image', '@vueuse/nuxt'],

  // Globalni CSS: tokeni, osnova, pomoćne klase, komponente (vidi assets/css/main.css)
  css: ['~/assets/css/main.css'],

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [{ name: 'theme-color', content: '#14120f' }],
    },
  },

  // Prevodi: i18n/locales/<kod>.json. Svaki jezik se učitava tek kada zatreba.
  i18n: {
    baseUrl: site.url,
    defaultLocale: 'sr',
    strategy: 'prefix_except_default', // sr na „/“, ostali na „/en“, „/ru“
    locales: [
      { code: 'sr', language: 'sr-Latn-RS', name: 'Srpski', file: 'sr.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
      { code: 'ru', language: 'ru', name: 'Русский', file: 'ru.json' },
    ],
    // Mnogi u Srbiji imaju browser na engleskom, pa ne preusmeravamo automatski.
    detectBrowserLanguage: false,
  },

  // Fontovi se preuzimaju i serviraju lokalno; ćirilica je uključena zbog ruskog.
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
      subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
    },
  },

  image: {
    quality: 80,
    format: ['avif', 'webp'],
  },
})
