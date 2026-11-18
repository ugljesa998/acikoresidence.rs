<script setup lang="ts">
import type { Apartment } from '~/data/apartments'

// Kartica stana: osnova gore, ispod sprat, broj, površina i kratak opis.
// Sa `to` cela kartica je link (izbor na početnoj); sa `detailed` prikazuje i površine po prostorijama (stranica Stanovi).
const props = defineProps<{
  apartment: Apartment
  tag?: string
  to?: string
  detailed?: boolean
}>()

const { t, localeProperties } = useI18n()

const formatArea = (n: number) =>
  new Intl.NumberFormat(localeProperties.value.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)

const planSrc = computed(() => `/images/plans/stan-${String(props.apartment.number).padStart(2, '0')}.jpg`)
const floorLabel = computed(() => t(`apartments.floors.${props.apartment.floor}`))
</script>

<template>
  <component :is="to ? resolveComponent('NuxtLink') : 'article'" :to="to" class="apt" :class="{ 'apt--link': to }">
    <div class="apt__plan">
      <NuxtImg
        :src="planSrc"
        :alt="t('apartments.planAlt', { n: apartment.number, floor: floorLabel })"
        sizes="100vw sm:50vw lg:480px"
        width="1200"
        height="1000"
        loading="lazy"
      />
      <span v-if="tag" class="apt__tag">{{ tag }}</span>
    </div>

    <div class="apt__body">
      <p class="apt__floor">{{ floorLabel }}</p>
      <div class="apt__head">
        <h3 class="apt__title">{{ t('apartments.unit', { n: apartment.number }) }}</h3>
        <p class="apt__area">{{ t('apartments.area', { n: formatArea(apartment.area) }) }}</p>
      </div>
      <p class="apt__meta">
        {{ t('apartments.bedrooms', apartment.bedrooms) }} ·
        {{ t('apartments.terrace', { n: formatArea(apartment.terrace) }) }}
      </p>

      <dl v-if="detailed" class="rooms">
        <div v-for="(room, i) in apartment.rooms" :key="i" class="rooms__row">
          <dt>{{ t(`apartments.rooms.${room[0]}`) }}</dt>
          <dd>{{ formatArea(room[1]) }}</dd>
        </div>
      </dl>

      <span v-if="to" class="apt__more">
        {{ t('apartments.details') }}
        <UiIcon name="arrow" />
      </span>
      <slot />
    </div>
  </component>
</template>

<style scoped>
.apt {
  display: flex;
  flex-direction: column;
  background: var(--color-surface-card);
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition:
    transform var(--duration-base) var(--ease-out),
    box-shadow var(--duration-base) var(--ease-out);
}

.apt--link:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-pop);
}

.apt__plan {
  position: relative;
  aspect-ratio: 6 / 5;
  overflow: hidden;
  background: var(--color-surface-sand);
}

.apt__plan img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--duration-slow) var(--ease-out);
}

.apt--link:hover .apt__plan img {
  transform: scale(1.04);
}

.apt__tag {
  position: absolute;
  top: 14px;
  left: 14px;
  padding: 7px 12px;
  border-radius: var(--radius-full);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-size: var(--text-2xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.apt__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: clamp(18px, 1.8vw, 26px);
}

.apt__floor {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.apt__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  margin-top: 6px;
  font-family: var(--font-display);
  font-size: clamp(24px, 2vw, 30px);
  font-weight: var(--weight-medium);
  line-height: 1.1;
}

.apt__title {
  font: inherit;
}

.apt__area {
  white-space: nowrap;
}

.apt__meta {
  margin-top: 8px;
  font-size: var(--text-md);
  color: var(--color-text-soft);
}

.rooms {
  margin-top: 16px;
  font-size: var(--text-md);
  border-top: 1px solid var(--color-line);
}

.rooms__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding-block: 7px;
  border-bottom: 1px solid var(--color-line);
}

.rooms__row dt {
  color: var(--color-text-soft);
}

.rooms__row dd {
  font-variant-numeric: tabular-nums;
}

.apt__more {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: auto;
  padding-top: 20px;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.apt__more .ui-icon {
  font-size: 17px;
  color: var(--color-accent);
  transition: transform 0.45s var(--ease-out);
}

.apt--link:hover .apt__more .ui-icon {
  transform: translateX(5px);
}
</style>
