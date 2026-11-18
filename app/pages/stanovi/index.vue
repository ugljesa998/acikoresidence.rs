<script setup lang="ts">
import { apartments, apartmentSlug, floors } from '~/data/apartments'
import { project } from '~/data/project'

// Kompletna ponuda (arhitektonski stil, tamna stranica): svi stanovi po spratovima, kratko (osnova, površina,
// sprat · sobe · terasa); površine po prostorijama su na stranici svakog stana.
// Gore naslov, kratak opis i red sa spratovima za brz skok; zatim za svaki sprat tanka linija,
// naziv i raspon (stanovi, m²), pa četiri kartice u kolonama odvojenim linijama (ista kartica kao na početnoj).
// Cela kartica vodi na stranicu tog stana (/stanovi/stan-N), gde su velika osnova i upit baš za taj stan.
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

// Spratovi odozdo nagore (I, II, III, povučeni), kao kad se ulazi u zgradu
const byFloor = computed(() =>
  [...floors].reverse().map((floor) => {
    const units = apartments.filter((a) => a.floor === floor)
    const numbers = units.map((a) => a.number)
    const areas = units.map((a) => a.area)
    return {
      floor,
      name: t(`apartments.floors.${floor}`),
      units,
      range: t('floorsList.units', { from: Math.min(...numbers), to: Math.max(...numbers) }),
      area: t('floorsList.area', { min: formatNumber(Math.min(...areas)), max: formatNumber(Math.max(...areas)) }),
    }
  }),
)

const unitTo = (number: number) => localePath(`/stanovi/${apartmentSlug(number)}`)

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

        <div class="page__intro">
          <p class="page__lead">{{ t('apartments.page.lead', summary) }}</p>
          <nav class="jump" :aria-label="t('floorsList.hint')">
            <a v-for="group in byFloor" :key="group.floor" :href="`#floor-${group.floor}`" class="jump__link">
              <span class="jump__name">{{ group.name }}</span>
              <span class="jump__range">{{ group.range }}</span>
            </a>
          </nav>
        </div>
      </div>
    </header>

    <section v-for="group in byFloor" :key="group.floor" class="floor" :aria-labelledby="`floor-${group.floor}`">
      <div class="container">
        <div class="floor__head">
          <h2 :id="`floor-${group.floor}`" class="floor__title">{{ group.name }}</h2>
          <p class="floor__meta">
            <span>{{ group.range }}</span>
            <span>{{ group.area }}</span>
          </p>
        </div>

        <ul class="floor__list">
          <li v-for="unit in group.units" :id="`stan-${unit.number}`" :key="unit.number">
            <ApartmentCard :apartment="unit" :to="unitTo(unit.number)" />
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  padding-bottom: clamp(64px, 7vw, 112px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

/* Vrh: header je preko njega providan, kao na početnoj */
.page__head {
  padding-top: calc(var(--header-h) + clamp(32px, 5vw, 80px));
}

.page__back {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
  transition: color var(--duration-fast) var(--ease-out);
}

.page__back:hover {
  color: var(--color-text-inverse);
}

.page__back .ui-icon {
  width: 16px;
  height: 16px;
  color: var(--color-accent);
  transform: rotate(180deg);
}

/* Naslov stranice: širok, tanak, kao naslov u heru */
.page__title {
  margin-top: clamp(20px, 2.4vw, 36px);
  font-size: var(--text-hero);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 0.98;
  letter-spacing: -0.035em;
}

/* Opis levo, skok na spratove desno, iznad tanke linije */
.page__intro {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: end;
  gap: 24px clamp(32px, 4vw, 72px);
  margin-top: clamp(28px, 3.4vw, 48px);
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.page__lead {
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Spratovi za brz skok: četiri polja odvojena tankim linijama */
.jump {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border: 1px solid var(--color-line-inverse);
}

.jump__link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  transition: background-color var(--duration-fast) var(--ease-out);
}

.jump__link + .jump__link {
  border-left: 1px solid var(--color-line-inverse);
}

.jump__link:hover {
  background: var(--color-accent);
}

.jump__name {
  font-size: 14px;
  font-weight: var(--weight-medium);
  white-space: nowrap;
}

.jump__range {
  font-size: 11px;
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.jump__link:hover .jump__range {
  color: var(--color-text-inverse-soft);
}

/* Sprat: naziv krupno levo, raspon desno, ispod tanke linije */
.floor {
  padding-top: clamp(64px, 7vw, 112px);
}

.floor__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px 24px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.floor__title {
  font-size: clamp(28px, 3vw, 48px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1.05;
  letter-spacing: -0.025em;
  scroll-margin-top: calc(var(--header-h-compact) + 24px);
}

.floor__meta {
  display: flex;
  gap: 0;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.floor__meta span + span::before {
  content: '';
  display: inline-block;
  width: 1px;
  height: 0.9em;
  margin-inline: 12px;
  vertical-align: -0.1em;
  background: var(--color-line-inverse-strong);
}

/* Četiri kolone tačno iste širine; tanka linija između njih stoji na sredini razmaka (kao na početnoj) */
.floor__list {
  --gap: 40px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: var(--gap);
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  border-bottom: 1px solid var(--color-line-inverse);
}

.floor__list > li {
  position: relative;
  scroll-margin-top: calc(var(--header-h-compact) + 16px);
}

.floor__list > li:not(:nth-child(4n + 1))::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 calc(var(--gap) / -2);
  width: 1px;
  background: var(--color-line-inverse);
}

/* Laptop i tablet: dve kolone */
@media (max-width: 1280px) {
  .floor__list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  /* u dve kolone linija stoji samo ispred desne kolone */
  .floor__list > li:nth-child(odd)::before {
    display: none;
  }

  .floor__list > li:nth-child(-n + 2) {
    border-bottom: 1px solid var(--color-line-inverse);
  }
}

@media (max-width: 900px) {
  .page__intro {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Telefon: jedna kolona; skok na spratove 2 × 2 */
@media (max-width: 600px) {
  .floor__list {
    grid-template-columns: minmax(0, 1fr);
    border-bottom: 0;
  }

  .floor__list > li::before {
    display: none;
  }

  .floor__list > li,
  .floor__list > li:nth-child(-n + 2) {
    border-bottom: 1px solid var(--color-line-inverse);
  }

  .jump {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .jump__link:nth-child(3) {
    border-left: 0;
  }

  .jump__link:nth-child(n + 3) {
    border-top: 1px solid var(--color-line-inverse);
  }
}
</style>
