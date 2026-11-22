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
  </div>
</template>
