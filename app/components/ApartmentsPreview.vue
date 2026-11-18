<script setup lang="ts">
import { apartments } from '~/data/apartments'
import { project } from '~/data/project'

// Stanovi na početnoj (arhitektonski stil): tri izdvojena stana (najmanji, sa dve spavaće sobe, sa najvećom
// terasom) kao tri kolone odvojene tankim linijama. Kartica je zajednička sa stranicom /stanovi (ApartmentCard);
// ovde je cela kartica link na taj stan na stranici /stanovi.
// Odmah posle ove sekcije ide OfferCta (fotografija i dugme ka svim stanovima).
const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const FEATURED = [
  { number: 13, tag: 'compact' },
  { number: 2, tag: 'family' },
  { number: 15, tag: 'terrace' },
] as const

const formatNumber = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: 0 }).format(n)

const featured = computed(() =>
  FEATURED.flatMap(({ number, tag }) => {
    const apartment = apartments.find((a) => a.number === number)
    return apartment
      ? [{ apartment, tag: t(`apartments.tags.${tag}`), to: `${localePath('/stanovi')}#stan-${number}` }]
      : []
  }),
)

const lead = computed(() =>
  t('apartments.lead', {
    n: project.units,
    min: formatNumber(project.minArea),
    max: formatNumber(project.maxArea),
  }),
)
</script>

<template>
  <section id="stanovi" class="apts" aria-labelledby="apartments-title">
    <div class="container">
      <div class="apts__head">
        <div>
          <p class="section-label">{{ t('apartments.eyebrow') }}</p>
          <h2 id="apartments-title" class="section-title apts__title">{{ t('apartments.title') }}</h2>
        </div>
        <p class="apts__lead">{{ lead }}</p>
      </div>

      <ul class="apts__list">
        <li v-for="item in featured" :key="item.apartment.number">
          <ApartmentCard :apartment="item.apartment" :tag="item.tag" :to="item.to" />
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.apts {
  padding-top: clamp(80px, 9vw, 144px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Oznaka i naslov levo, kratak opis desno, ispod tanke linije */
.apts__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: 24px 48px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.apts__title {
  margin-top: clamp(16px, 1.8vw, 28px);
}

.apts__lead {
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Tri kolone tačno iste širine; tanka linija između njih stoji na sredini razmaka,
   pa su slike, oznake i naslovi u sve tri kolone u istoj liniji */
.apts__list {
  --gap: 48px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--gap);
  margin: clamp(32px, 3.6vw, 56px) 0 0;
  padding: 0;
  list-style: none;
  border-block: 1px solid var(--color-line-inverse);
}

.apts__list > li {
  position: relative;
  display: grid;
}

.apts__list > li + li::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 calc(var(--gap) / -2);
  width: 1px;
  background: var(--color-line-inverse);
}

/* Tablet i telefon: stanovi jedan ispod drugog, odvojeni linijom */
@media (max-width: 900px) {
  .apts__head {
    grid-template-columns: minmax(0, 1fr);
  }

  .apts__list {
    grid-template-columns: minmax(0, 1fr);
    border-bottom: 0;
  }

  .apts__list > li {
    border-bottom: 1px solid var(--color-line-inverse);
  }

  .apts__list > li + li::before {
    display: none;
  }
}
</style>
