// Osnovni podaci o sajtu i brendu (ne prevode se).
// Koriste ih i SEO delovi: meta oznake, strukturisani podaci (JSON-LD), sitemap.xml, robots.txt i llms.txt.

// Instagram profil brenda: link u kontaktu i footeru, a ide i u „sameAs“ ispod.
const instagram = { handle: '@acikoresidence', url: 'https://www.instagram.com/acikoresidence/' }

export const site = {
  name: 'ACIKO Residence',
  brandSuffix: 'Residence', // stoji uz logo ACIKO
  url: 'https://acikoresidence.rs',

  // Datum poslednje izmene sadržaja (ponuda, stanje stanova, tekstovi). Ide u sitemap.xml i llms.txt
  // kao „lastmod“ — pretraživači i AI asistenti po njemu znaju da je podatak svež. Menjati pri svakoj izmeni.
  updated: '2026-11-22',

  // Adresa zgrade, ista svuda (sajt, Google Business profil, oglasi na portalima) — doslednost pomaže lokalnom SEO-u.
  address: {
    street: 'Kneza Miloša',
    postalCode: '36210',
    city: 'Vrnjačka Banja',
    region: 'Raški okrug',
    country: 'RS',
  },

  // Slika koja se vidi kad se link podeli (Viber, WhatsApp, Facebook…) i na početnoj u pretrazi
  ogImage: { src: '/images/hero.jpg', width: 1774, height: 887 },

  // Logo za Google (kvadratni, najmanje 112 × 112 px)
  logo: '/apple-touch-icon.png',

  instagram,

  // Profili brenda na drugim mestima: Instagram, Facebook, Google Business profil, YouTube…
  // Pune adrese. Pomažu Google-u i AI asistentima da povežu brend sa sajtom (strukturisani podaci, llms.txt).
  sameAs: [instagram.url] as string[],

  // Google Tag Manager kontejner (tagmanager.google.com). U njemu se podešavaju Google Analytics, Google Ads
  // i Meta Pixel, bez izmene koda. Prazno = GTM se ne učitava.
  gtmId: 'GTM-KGHKKZWV',
} as const

// Jezici sajta — koriste ih nuxt.config.ts (i18n) i sitemap.xml.
export const locales = [
  { code: 'sr', language: 'sr-Latn-RS', name: 'Srpski', file: 'sr.json' },
  { code: 'en', language: 'en', name: 'English', file: 'en.json' },
  { code: 'ru', language: 'ru', name: 'Русский', file: 'ru.json' },
] as const

export const defaultLocale = 'sr'

/** Pun URL (sa domenom) za putanju na sajtu; početna je bez kose crte na kraju, kao canonical. */
export const absoluteUrl = (path: string) => (path === '/' || path === '' ? site.url : `${site.url}${path}`)

/** Putanja za jezik: srpski bez prefiksa, ostali sa /en, /ru. */
export const localizedPath = (path: string, code: string) =>
  code === defaultLocale ? path : path === '/' ? `/${code}` : `/${code}${path}`
