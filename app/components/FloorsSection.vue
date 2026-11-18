<script setup lang="ts">
import { apartments, floors } from '~/data/apartments'

// Spratovi (arhitektonski stil): tabela odozgo nadole, kao na zgradi. Za svaki sprat: naziv, brojevi stanova,
// raspon površina i jedna odlika (sobe; na spratu bez dvosobnih stanova najveća terasa).
// Sve se računa iz data/apartments.ts. Svaki red vodi na taj sprat na stranici /stanovi.
const { t, localeProperties } = useI18n()
const localePath = useLocalePath()

const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: digits }).format(n)

const rows = computed(() =>
  floors.map((floor) => {
    const units = apartments.filter((a) => a.floor === floor)
    const numbers = units.map((a) => a.number)
    const areas = units.map((a) => a.area)
    const hasTwoBedrooms = units.some((a) => a.bedrooms === 2)

    return {
      floor,
      name: t(`apartments.floors.${floor}`),
      units: t('floorsList.units', { from: Math.min(...numbers), to: Math.max(...numbers) }),
      area: t('floorsList.area', { min: formatNumber(Math.min(...areas)), max: formatNumber(Math.max(...areas)) }),
      detail: hasTwoBedrooms
        ? t('floorsList.bedroomsRange')
        : t('floorsList.terraceUpTo', { n: formatNumber(Math.max(...units.map((a) => a.terrace)), 1) }),
      to: `${localePath('/stanovi')}#floor-${floor}`,
    }
  }),
)
</script>

<template>
  <section id="spratovi" class="floors" aria-labelledby="floors-title">
    <div class="container">
      <div class="floors__head">
        <h2 id="floors-title" class="floors__title">{{ t('floorsList.title') }}</h2>
        <p class="floors__hint">{{ t('floorsList.hint') }}</p>
      </div>

      <ul class="floors__list">
        <li v-for="row in rows" :key="row.floor">
          <NuxtLink :to="row.to" class="row">
            <strong class="row__name">{{ row.name }}</strong>
            <span class="row__cell">{{ row.units }}</span>
            <span class="row__cell">{{ row.area }}</span>
            <span class="row__cell row__cell--detail">{{ row.detail }}</span>
            <UiIcon name="arrow" class="row__arrow" />
          </NuxtLink>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.floors {
  padding-block: clamp(96px, 11vw, 168px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

.floors__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 20px;
}

.floors__title {
  font-size: clamp(32px, 3.6vw, 56px);
  font-weight: var(--weight-regular);
  font-stretch: var(--stretch-wide);
  line-height: 1;
  letter-spacing: -0.02em;
}

.floors__hint {
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

.floors__list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-bottom: 1px solid var(--color-line-inverse);
}

/* Red tabele: naziv | stanovi | površine | odlika | strelica */
.row {
  display: grid;
  grid-template-columns: 4fr 3fr 2fr 3fr 40px;
  align-items: baseline;
  gap: 16px;
  padding-block: 22px;
  border-top: 1px solid var(--color-line-inverse);
}

.row__name {
  font-size: var(--text-row);
  font-weight: var(--weight-regular);
  font-stretch: 110%;
  letter-spacing: -0.01em;
}

.row__cell {
  color: var(--color-text-inverse-muted);
  transition: color var(--duration-fast) var(--ease-out);
}

.row__arrow {
  justify-self: end;
  font-size: 18px;
  color: var(--color-accent);
  transition: transform 0.45s var(--ease-out);
}

.row:hover .row__cell {
  color: var(--color-text-inverse-soft);
}

.row:hover .row__arrow {
  transform: translateX(6px);
}

/* Tablet i telefon: naziv u svom redu, ispod stanovi i površine; odlika i strelica se ne prikazuju */
@media (max-width: 980px) {
  .row {
    grid-template-columns: minmax(0, 1fr) auto;
    row-gap: 4px;
  }

  .row__name {
    grid-column: 1 / -1;
  }

  .row__cell--detail,
  .row__arrow {
    display: none;
  }
}
</style>
