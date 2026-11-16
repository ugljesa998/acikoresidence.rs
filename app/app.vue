<script setup lang="ts">
const { t } = useI18n()
const i18nHead = useLocaleHead({ seo: true })

useHead(() => ({
  htmlAttrs: { lang: i18nHead.value.htmlAttrs?.lang },
  link: [...(i18nHead.value.link || [])],
  meta: [...(i18nHead.value.meta || [])],
}))

useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
  ogImage: '/images/hero.jpg',
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <main>
      <NuxtPage />
    </main>
    <MobileActionBar />
  </div>
</template>
