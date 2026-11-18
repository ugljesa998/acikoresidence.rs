<script setup lang="ts">
import { apartments, floors } from '~/data/apartments'
import { project } from '~/data/project'

// Kompletna ponuda: svi stanovi po spratovima, sa osnovom i površinama po prostorijama.
// Posebna stranica (a ne samo sekcija na početnoj) da bi je pretraživači indeksirali zasebno.
const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const formatNumber = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: 0 }).format(n)

const summary = computed(() => ({
  n: project.units,
  min: formatNumber(project.minArea),
  max: formatNumber(project.maxArea),
}))

const byFloor = computed(() =>
  [...floors].reverse().map((floor) => ({
    floor,
    units: apartments.filter((a) => a.floor === floor),
  })),
)

const contactTo = computed(() => ({ path: localePath('/'), hash: '#kontakt' }))
const { apartment } = useInquiry() // klik na „Zatražite ponudu“ upisuje stan u formu na početnoj

useSeoMeta({
  title: () => t('apartments.page.metaTitle'),
  description: () => t('apartments.page.metaDescription', summary.value),
  ogTitle: () => t('apartments.page.metaTitle'),
  ogDescription: () => t('apartments.page.metaDescription', summary.value),
})
</script>

<template>
  <div class="page">
    <header class="page__head">
      <div class="container">
        <NuxtLink :to="localePath('/')" class="page__back">
          <UiIcon name="arrow" />
          {{ t('apartments.page.back') }}
        </NuxtLink>
        <h1 class="page__title">{{ t('apartments.page.title') }}</h1>
        <p class="page__lead">{{ t('apartments.page.lead', summary) }}</p>
      </div>
    </header>

    <section v-for="group in byFloor" :key="group.floor" class="floor" :aria-labelledby="`floor-${group.floor}`">
      <div class="container">
        <h2 :id="`floor-${group.floor}`" class="floor__title">{{ t(`apartments.floors.${group.floor}`) }}</h2>
        <ul class="floor__list">
          <li v-for="unit in group.units" :id="`stan-${unit.number}`" :key="unit.number">
            <ApartmentCard :apartment="unit" detailed>
              <NuxtLink :to="contactTo" class="floor__cta" @click="apartment = unit.number">
                {{ t('cta.offer') }}
                <UiIcon name="arrow" />
              </NuxtLink>
            </ApartmentCard>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-bottom: clamp(56px, 6vw, 104px);
}

/* Tamna traka na vrhu: header je preko nje providan, kao na početnoj */
.page__head {
  padding-block: calc(var(--header-h) + clamp(28px, 4vw, 64px)) clamp(36px, 4.5vw, 72px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
}

.page__back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.page__back .ui-icon {
  font-size: 16px;
  transform: rotate(180deg);
}

.page__title {
  margin-top: 20px;
  font-family: var(--font-display);
  font-size: clamp(38px, 4.6vw, 76px);
  font-weight: var(--weight-medium);
  line-height: 1;
  letter-spacing: var(--tracking-display);
}

.page__lead {
  max-width: 38em;
  margin-top: 18px;
  font-size: var(--text-lead);
  line-height: 1.6;
  color: var(--color-text-inverse-soft);
}

.floor {
  padding-top: clamp(36px, 4vw, 64px);
}

.floor__title {
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-line-strong);
  font-family: var(--font-display);
  font-size: clamp(24px, 2.2vw, 34px);
  font-weight: var(--weight-medium);
  line-height: 1.1;
}

.floor__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(14px, 1.4vw, 22px);
  margin: clamp(18px, 2vw, 28px) 0 0;
  padding: 0;
  list-style: none;
}

.floor__list > li {
  display: grid;
  scroll-margin-top: calc(var(--header-h-compact) + 16px);
}

.floor__cta {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.floor__cta .ui-icon {
  font-size: 17px;
  color: var(--color-accent);
  transition: transform 0.45s var(--ease-out);
}

.floor__cta:hover .ui-icon {
  transform: translateX(5px);
}

@media (max-width: 1280px) {
  .floor__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .floor__list {
    grid-template-columns: 1fr;
  }
}
</style>
