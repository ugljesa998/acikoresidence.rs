<script setup lang="ts">
import { apartments, isSold, type FloorKey } from '~/data/apartments'

// Stanovi: izbor sprata, pa četiri stana tog sprata sa osnovom i površinama po prostorijama.
// Dugme na stanu vodi na formu sa već izabranim stanom.
const { t, localeProperties } = useI18n()
const { askFor } = useInquiry()

const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const floorKeys: FloorKey[] = ['f1', 'f2', 'f3', 'ph']
const activeFloor = ref<FloorKey>('f1')

const units = computed(() => apartments.filter((a) => a.floor === activeFloor.value))
const planSrc = (n: number) => `/images/plans/stan-${String(n).padStart(2, '0')}.png`
</script>

<template>
  <section id="stanovi" class="section section--gray" aria-labelledby="apartments-title">
    <div class="container">
      <header class="section-head">
        <h2 id="apartments-title" class="h2">{{ t('apartments.title') }}</h2>
        <p class="lead">{{ t('apartments.lead') }}</p>
      </header>

      <div class="floors" role="group" :aria-label="t('apartments.floorsLabel')">
        <button
          v-for="key in floorKeys"
          :key="key"
          type="button"
          class="floors__btn"
          :class="{ 'is-active': key === activeFloor }"
          :aria-pressed="key === activeFloor"
          @click="activeFloor = key"
        >
          {{ t(`apartments.floors.${key}`) }}
        </button>
      </div>

      <ul class="units">
        <li v-for="unit in units" :key="unit.number" class="unit" :class="{ 'is-sold': isSold(unit.number) }">
          <div class="unit__plan">
            <NuxtImg
              :src="planSrc(unit.number)"
              :alt="t('apartments.planAlt', { n: unit.number, floor: t(`apartments.floors.${unit.floor}`) })"
              sizes="100vw sm:50vw lg:320px"
              format="webp"
              width="1200"
              height="980"
              loading="lazy"
            />
          </div>

          <div class="unit__body">
            <div class="unit__top">
              <h3 class="unit__title">{{ t('apartments.unit', { n: unit.number }) }}</h3>
              <span class="status" :class="{ 'status--sold': isSold(unit.number) }">
                {{ isSold(unit.number) ? t('apartments.sold') : t('apartments.free') }}
              </span>
            </div>
            <p class="unit__summary">
              <span class="num">{{ t('apartments.area', { n: formatArea(unit.area) }) }}</span>
              · {{ t('apartments.bedrooms', { n: unit.bedrooms }, unit.bedrooms) }}
            </p>

            <dl class="rooms">
              <div v-for="(room, i) in unit.rooms" :key="i" class="rooms__row">
                <dt>{{ t(`apartments.rooms.${room[0]}`) }}</dt>
                <dd class="num">{{ formatArea(room[1]) }}</dd>
              </div>
              <div class="rooms__row rooms__row--total">
                <dt>{{ t('apartments.total') }}</dt>
                <dd class="num">{{ t('apartments.area', { n: formatArea(unit.area) }) }}</dd>
              </div>
            </dl>

            <button
              v-if="!isSold(unit.number)"
              type="button"
              class="btn btn--secondary btn--small unit__cta"
              @click="askFor(unit.number)"
            >
              {{ t('apartments.cta', { n: unit.number }) }}
              <UiIcon name="arrow" />
            </button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
/* Izbor sprata: jedna traka sa četiri dugmeta */
.floors {
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 4px;
  padding: 4px;
  margin-bottom: 24px;
  border-radius: var(--radius-md);
  background: var(--color-surface-strong);
}

.floors__btn {
  min-height: 44px;
  padding: 0 22px;
  border-radius: var(--radius-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-muted);
  white-space: nowrap;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.floors__btn:hover {
  color: var(--color-text);
}

.floors__btn.is-active {
  background: var(--color-bg);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.08);
}

/* Stanovi: 2 × 2, u svakoj kartici osnova levo i podaci desno */
.units {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.unit {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--color-bg);
}

.unit__plan {
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--color-plan-bg);
}

.unit__plan img {
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm);
}

.unit__body {
  display: flex;
  flex-direction: column;
  padding: 24px;
}

.unit__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.unit__title {
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.unit__summary {
  margin-top: 4px;
  color: var(--color-text-muted);
}

.rooms {
  margin-block: 18px 20px;
  font-size: var(--text-sm);
}

.rooms__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-block: 7px;
  border-bottom: 1px solid var(--color-line);
}

.rooms__row dt {
  color: var(--color-text-muted);
}

.rooms__row--total {
  border-bottom: 0;
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
}

.rooms__row--total dt {
  color: var(--color-text);
}

.unit__cta {
  margin-top: auto;
  align-self: flex-start;
}

.unit.is-sold .unit__plan img {
  opacity: 0.45;
}

@media (max-width: 1100px) {
  .units {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .floors {
    display: grid;
    grid-auto-flow: row;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .floors__btn {
    padding: 0 8px;
  }

  .unit {
    grid-template-columns: 1fr;
  }

  .unit__body {
    padding: 20px;
  }

  .unit__cta {
    align-self: stretch;
  }
}
</style>
