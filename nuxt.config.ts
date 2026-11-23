// https://nuxt.com/docs/api/configuration/nuxt-config
import { defaultLocale, locales, site } from './app/data/site'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n', '@nuxt/fonts', '@nuxt/image', '@vueuse/nuxt'],

  // Globalni CSS: tokeni, osnova, pomoćne klase, komponente (vidi assets/css/main.css)
  css: ['~/assets/css/main.css'],

  // Upiti i prijave na novosti idu mejlom prodaji preko SMTP-a — podešavanja su u .env (vidi .env.example
  // i server/utils/mail.ts). Webhook ispod je dodatna, neobavezna putanja (npr. upis u tabelu ili CRM):
  // NUXT_INQUIRY_WEBHOOK za upite; prazno = ne koristi se.
  runtimeConfig: {
    inquiryWebhook: '',
    // Isto za prijave na novosti (server/api/newsletter.post.ts): NUXT_NEWSLETTER_WEBHOOK.
    newsletterWebhook: '',
  },

  app: {
    head: {
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { name: 'theme-color', content: '#14120f' },
        { name: 'color-scheme', content: 'dark' },
      ],
    },
  },

  // Prevodi: i18n/locales/<kod>.json. Svaki jezik se učitava tek kada zatreba.
  i18n: {
    baseUrl: site.url,
    defaultLocale,
    strategy: 'prefix_except_default', // sr na „/“, ostali na „/en“, „/ru“
    locales: locales.map((l) => ({ ...l })), // spisak jezika je u app/data/site.ts (koristi ga i sitemap.xml)
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
    families: [
      // Archivo (početna, header): varijabilan i po debljini i po širini, jer naslovi i brojevi koriste
      // proširenu varijantu (font-stretch 110–125%). Nema ćirilicu, pa ruski tekst pada na sistemski font.
      {
        name: 'Archivo',
        provider: 'google',
        weights: ['300 700'],
        styles: ['normal'],
        variableAxis: { wdth: [[100, 125]] },
      },
    ],
  },

  image: {
    quality: 80,
    format: ['avif', 'webp'],
    // Obrađene slike (/_ipx) browser čuva godinu dana (inače samo 1 minut), pa ponovna poseta ne skida ništa.
    // Zato zamenjena slika mora dobiti novo ime fajla — pod starim imenom posetioci bi i dalje videli staru.
    ipx: { maxAge: 31_536_000 },
  },

  // Isto za logo i slike koje se učitavaju direktno (logo u headeru, slika za deljenje linka).
  routeRules: {
    '/brand/**': { headers: { 'cache-control': 'public, max-age=31536000' } },
    '/images/**': { headers: { 'cache-control': 'public, max-age=31536000' } },
  },

  // SEO fajlovi (server/routes) se prave pri build-u kao statični, pa rade i uz `npm run generate`.
  nitro: {
    prerender: {
      routes: ['/sitemap.xml', '/robots.txt', '/llms.txt'],
    },
  },
})
