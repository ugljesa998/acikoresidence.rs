<script setup lang="ts">
import { absoluteUrl, site } from '~/data/site'

const { t } = useI18n()
// lang, canonical, hreflang (sr / en / ru / x-default), og:url i og:locale za svaku stranicu
const i18nHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: { lang: i18nHead.value.htmlAttrs?.lang },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
}))

// Podrazumevane meta oznake (stranice ih menjaju svojim naslovom, opisom i slikom).
// og:image mora biti pun URL sa domenom, inače se slika ne vidi kad se link podeli na Viberu, WhatsApp-u, Facebook-u.
useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
  ogType: 'website',
  ogSiteName: site.name,
  ogImage: () => ({
    url: absoluteUrl(site.ogImage.src),
    width: site.ogImage.width,
    height: site.ogImage.height,
    alt: t('hero.imageAlt'),
  }),
  twitterCard: 'summary_large_image',
  // Velike sličice u Google-u (Discover, slike) i pun opis u rezultatima
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
})

// Google Tag Manager (analitika i oglasi), ID je u app/data/site.ts. Samo na pravom sajtu, ne u lokalnom razvoju,
// da posete sa localhost-a ne ulaze u statistiku. Događaji sa sajta (upit, klik na telefon/poruku, prijava na
// novosti) idu u isti `dataLayer` — vidi composables/useTrack.ts.
// Skripta prvo postavlja pristanak na kolačiće iz sačuvanog izbora; bez izbora je sve odbijeno dok posetilac
// ne klikne „Prihvatam“ na baneru (components/CookieBanner.vue, utils/consent.ts).
// GTM (180 KB) se učitava tek kad se stranica učita, da ne otima mrežu hero slici i fontovima na telefonu
// (PageSpeed). Događaji poslati pre toga čekaju u `dataLayer` i odu čim se GTM učita.
if (site.gtmId && !import.meta.dev) {
  const gtmUrl = `https://www.googletagmanager.com/gtm.js?id=${site.gtmId}`
  const loadGtm = `window.addEventListener('load', function () {
  var s = document.createElement('script');
  s.async = true;
  s.src = '${gtmUrl}';
  document.head.appendChild(s);
});`
  useHead({
    script: [{ key: 'gtm', innerHTML: `${consentBootScript()}\n${loadGtm}`, tagPriority: 'high' }],
  })
}

// Strukturisani podaci na svakoj stranici: prodavac, sajt i zgrada (composables/useSchemaOrg.ts)
const schema = useSchemaOrg()
useJsonLd('site', () => [schema.organization(), schema.website(), schema.residence()])
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <main>
      <NuxtPage />
    </main>
    <SiteFooter />
    <MobileActionBar />
    <CookieBanner />
  </div>
</template>
