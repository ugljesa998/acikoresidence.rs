<script setup lang="ts">
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { building, byCar, nearby } from '~/data/location'

// Lokacija: prava mapa (OpenStreetMap preko Leaflet-a) sa zgradom i numerisanim mestima u blizini,
// a pored nje koliko je šta daleko peške i kolima. Prelaskom preko stavke ističe se tačka na mapi i obrnuto.
// Podaci su u data/location.ts. Leaflet se učitava samo u pregledaču, tek kad se sekcija prikaže.
const { t, localeProperties } = useI18n()

const WALK_METERS_PER_MINUTE = 80 // ≈ 4,8 km/h, obična šetnja

const formatTime = (minutes: number, approx = false) => {
  const value =
    minutes >= 60
      ? t('location.hours', {
          n: new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: 1 }).format(minutes / 60),
        })
      : t('location.minutes', { n: minutes })
  return approx ? t('location.approx', { v: value }) : value
}

const places = computed(() =>
  nearby.map((place, i) => ({
    key: place.key,
    number: i + 1,
    name: t(`location.places.${place.key}`),
    time: formatTime(Math.round(place.walkMeters / WALK_METERS_PER_MINUTE)),
  })),
)

const routes = computed(() =>
  byCar.map((route) => ({
    key: route.key,
    name: t(`location.car.${route.key}`),
    time: formatTime(route.minutes, route.approx),
  })),
)

const motorwayTime = computed(() => formatTime(byCar.find((r) => r.key === 'motorway')?.minutes ?? 0))

const active = ref<string | null>(null)

// Mapa
const mapEl = ref<HTMLElement | null>(null)
const pinEl = (key: string | null) => (key ? mapEl.value?.querySelector(`.loc-pin--${key}`) : null)
let map: LeafletMap | undefined

async function createMap() {
  if (!mapEl.value || map) return
  const L = (await import('leaflet')).default
  if (!mapEl.value || map) return

  const touch = window.matchMedia('(pointer: coarse)').matches
  map = L.map(mapEl.value, {
    scrollWheelZoom: false, // točkić skroluje stranicu, ne mapu
    dragging: !touch, // na telefonu jedan prst skroluje stranicu; mapa se pomera i zumira sa dva prsta
    zoomControl: false,
    attributionControl: false,
  })
  L.control.zoom({ position: 'bottomright' }).addTo(map)
  L.control.attribution({ prefix: false }).addTo(map)

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  }).addTo(map)

  nearby.forEach((place, i) => {
    const marker = L.marker([place.lat, place.lon], {
      icon: L.divIcon({ className: `loc-pin loc-pin--${place.key}`, html: String(i + 1), iconSize: [26, 26] }),
      title: t(`location.places.${place.key}`),
      keyboard: false,
    }).addTo(map!)
    marker.on('mouseover', () => (active.value = place.key))
    marker.on('mouseout', () => (active.value = null))
  })

  L.marker([building.lat, building.lon], {
    icon: L.divIcon({
      className: 'loc-home',
      html: `<span class="loc-home__dot"></span><span class="loc-home__label">${t('location.building')}</span>`,
      iconSize: [16, 16],
    }),
    zIndexOffset: 1000,
    keyboard: false,
  }).addTo(map)

  map.fitBounds(
    L.latLngBounds([[building.lat, building.lon], ...nearby.map((p) => [p.lat, p.lon] as [number, number])]),
    { padding: [36, 36] },
  )

  pinEl(active.value)?.classList.add('is-active')
}

const { stop } = useIntersectionObserver(
  mapEl,
  ([entry]) => {
    if (entry?.isIntersecting) {
      stop()
      createMap()
    }
  },
  { rootMargin: '400px' },
)

watch(active, (now, before) => {
  pinEl(before)?.classList.remove('is-active')
  pinEl(now)?.classList.add('is-active')
})

onBeforeUnmount(() => {
  map?.remove()
  map = undefined
})
</script>

<template>
  <section id="lokacija" class="loc" aria-labelledby="location-title">
    <div class="container">
      <header class="loc__head">
        <div>
          <p class="loc__eyebrow">
            <span class="loc__mark" aria-hidden="true" />
            {{ t('location.eyebrow') }}
          </p>
          <h2 id="location-title" class="loc__title">{{ t('location.title') }}</h2>
        </div>
        <p class="loc__lead">{{ t('location.lead', { m: motorwayTime }) }}</p>
      </header>

      <div class="loc__grid">
        <div class="map">
          <div ref="mapEl" class="map__canvas" role="application" :aria-label="t('location.mapAlt')" />
        </div>

        <div class="loc__lists">
          <div>
            <h3 class="loc__subtitle">{{ t('location.walkTitle') }}</h3>
            <ol class="walk">
              <li
                v-for="place in places"
                :key="place.key"
                class="walk__item"
                :class="{ 'is-active': active === place.key }"
                @mouseenter="active = place.key"
                @mouseleave="active = null"
              >
                <span class="walk__num" aria-hidden="true">{{ place.number }}</span>
                <span class="walk__name">{{ place.name }}</span>
                <span class="walk__time">{{ place.time }}</span>
              </li>
            </ol>
          </div>

          <div>
            <h3 class="loc__subtitle">{{ t('location.carTitle') }}</h3>
            <ul class="car">
              <li v-for="route in routes" :key="route.key" class="car__item">
                <span class="car__time">{{ route.time }}</span>
                <span class="car__name">{{ route.name }}</span>
              </li>
            </ul>
          </div>

          <a :href="building.mapsUrl" class="loc__link" target="_blank" rel="noopener">
            {{ t('location.mapLink') }}
            <UiIcon name="arrow" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Ista svetla podloga kao sekcija iznad; razdvaja ih samo tanka linija, ne promena boje */
.loc {
  padding-bottom: clamp(48px, 5vw, 88px);
  background: var(--color-bg);
}

.loc__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: clamp(20px, 4vw, 64px);
  padding-top: clamp(48px, 5vw, 88px);
  border-top: 1px solid var(--color-line-strong);
}

.loc__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--color-text-subtle);
}

.loc__mark {
  width: 13px;
  height: 12px;
  background: var(--color-brand);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.loc__title {
  max-width: 17em;
  margin-top: 16px;
  font-family: var(--font-display);
  font-size: var(--text-h2);
  font-weight: var(--weight-regular);
  line-height: 1.12;
  letter-spacing: var(--tracking-display);
  text-wrap: balance;
}

.loc__lead {
  max-width: 34em;
  line-height: 1.65;
  color: var(--color-text-soft);
}

.loc__grid {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  align-items: start;
  gap: clamp(24px, 4vw, 72px);
  margin-top: clamp(28px, 3.4vw, 52px);
}

/* Mapa: okvir je ovde, a oznake na mapi pravi Leaflet van komponente (vidi drugi <style> ispod) */
.map {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-sm);
  background: var(--color-surface-sand);
  isolation: isolate; /* Leaflet-ovi slojevi ne smeju preko header-a */
}

.map__canvas {
  position: absolute;
  inset: 0;
  font-family: var(--font-sans);
}

/* Liste */
.loc__lists {
  display: grid;
  gap: clamp(24px, 2.6vw, 36px);
}

.loc__subtitle {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-line-strong);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.walk {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: clamp(20px, 2.4vw, 40px);
  margin: 0;
  padding: 0;
  list-style: none;
}

.walk__item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding-block: 11px;
  border-bottom: 1px solid var(--color-line);
}

.walk__num {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-line-strong);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out);
}

.walk__item.is-active .walk__num {
  border-color: var(--color-accent);
  background: var(--color-accent);
  color: var(--color-text-inverse);
}

.walk__time {
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.car {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.car__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 16px 0;
  border-left: 1px solid var(--color-line);
}

.car__item:first-child {
  padding-left: 0;
  border-left: 0;
}

.car__time {
  font-family: var(--font-display);
  font-size: clamp(22px, 1.9vw, 28px);
  font-weight: var(--weight-medium);
  line-height: 1.1;
  white-space: nowrap;
}

.car__name {
  font-size: var(--text-sm);
  color: var(--color-text-soft);
}

.loc__link {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  gap: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-line-strong);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
}

.loc__link .ui-icon {
  font-size: 17px;
  color: var(--color-accent);
  transition: transform 0.45s var(--ease-out);
}

.loc__link:hover .ui-icon {
  transform: translateX(5px);
}

@media (max-width: 900px) {
  .loc__head,
  .loc__grid {
    grid-template-columns: 1fr;
  }

  .loc__head {
    align-items: start;
  }
}

@media (max-width: 560px) {
  .walk {
    grid-template-columns: 1fr;
  }

  .car {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    row-gap: 4px;
  }

  .car__item:nth-child(odd) {
    padding-left: 0;
    border-left: 0;
  }

  .map {
    aspect-ratio: 4 / 5;
  }
}
</style>

<!-- Oznake i kontrole pravi Leaflet, pa do njih scoped stilovi ne dopiru. -->
<style>
/* Topliji, mirniji ton podloge da se mapa uklopi u paletu sajta */
#lokacija .leaflet-tile-pane {
  filter: sepia(0.28) saturate(0.75) contrast(0.96);
}

.loc-pin {
  display: grid;
  place-items: center;
  border: 2px solid var(--color-text-inverse);
  border-radius: var(--radius-full);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  box-shadow: var(--shadow-pop);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

/* Bez uvećanja: Leaflet postavlja oznaku preko `transform`, pa bi je `scale` pomerio sa mesta */
.loc-pin.is-active {
  z-index: 900 !important;
  background: var(--color-accent);
  box-shadow: 0 0 0 7px color-mix(in srgb, var(--color-accent) 30%, transparent);
}

.loc-home {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: visible;
}

.loc-home__dot {
  position: relative;
  flex: none;
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-text-inverse);
  border-radius: var(--radius-full);
  background: var(--color-brand);
}

.loc-home__dot::after {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: inherit;
  background: var(--color-brand);
  animation: loc-home-pulse 2.6s var(--ease-out) infinite;
}

@keyframes loc-home-pulse {
  from {
    transform: scale(1);
    opacity: 0.5;
  }
  to {
    transform: scale(3.2);
    opacity: 0;
  }
}

.loc-home__label {
  padding: 5px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.06em;
  white-space: nowrap;
  box-shadow: var(--shadow-pop);
}

#lokacija .leaflet-bar {
  border: 0;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-pop);
}

#lokacija .leaflet-bar a {
  color: var(--color-text);
}

#lokacija .leaflet-control-attribution {
  background: var(--color-surface-glass);
  font-size: var(--text-2xs);
}
</style>
