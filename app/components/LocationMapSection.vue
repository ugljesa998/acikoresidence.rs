<script setup lang="ts">
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { building, byCar, nearby } from '~/data/location'

// Lokacija (arhitektonski stil): gore oznaka, naslov i kratak opis; ispod, u dve polovine, tamna mapa
// (OpenStreetMap preko Leaflet-a) sa zgradom i numerisanim mestima levo, a desno koliko je šta daleko
// peške (redovi tabele u dve kolone, uz vrh mape) i kolima (krupni brojevi, uz dno mape).
// Prelaskom preko stavke ističe se tačka na mapi i obrnuto.
// Podaci su u data/location.ts. Leaflet se učitava samo u pregledaču, tek kad se sekcija približi ekranu.
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
    { padding: [40, 40] },
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
      <div class="loc__head">
        <div>
          <p class="section-label">{{ t('location.eyebrow') }}</p>
          <h2 id="location-title" class="section-title loc__title">{{ t('location.title') }}</h2>
        </div>
        <p class="loc__lead">{{ t('location.lead', { m: motorwayTime }) }}</p>
      </div>

      <div class="loc__body">
        <div class="map">
          <div ref="mapEl" class="map__canvas" role="application" :aria-label="t('location.mapAlt')" />
        </div>

        <div class="loc__side">
          <div class="loc__group">
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

          <div class="loc__group">
            <h3 class="loc__subtitle">{{ t('location.carTitle') }}</h3>
            <ul class="car">
              <li v-for="route in routes" :key="route.key" class="car__item">
                <span class="car__time">{{ route.time }}</span>
                <span class="car__name">{{ route.name }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Uži razmak na vrhu: odmah iznad je kratak panel za novosti (NewsletterSection) */
.loc {
  padding-top: clamp(40px, 4.5vw, 72px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Oznaka i naslov levo, kratak opis desno, ispod tanke linije (kao sekcija Stanovi) */
.loc__head {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);
  align-items: end;
  gap: 24px 48px;
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.loc__title {
  margin-top: clamp(16px, 1.8vw, 28px);
}

.loc__lead {
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Dve polovine: mapa levo (iste visine kao desna kolona), liste i dugme desno */
.loc__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(24px, 3vw, 48px);
  margin-top: clamp(32px, 3.6vw, 56px);
}

/* Mapa: okvir je ovde, a oznake na mapi pravi Leaflet van komponente (vidi drugi <style> ispod) */
.map {
  position: relative;
  min-height: clamp(400px, 37vw, 560px);
  overflow: hidden;
  background: var(--color-surface-inverse-raised);
  isolation: isolate; /* Leaflet-ovi slojevi ne smeju preko header-a */
}

.map__canvas {
  position: absolute;
  inset: 0;
  font-family: var(--font-grotesk);
}

/* Dve grupe (peške, kolima): prva uz gornju ivicu mape, druga uz donju, pa desno nema rupe */
.loc__side {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(24px, 2.4vw, 36px);
}

.loc__subtitle {
  padding-bottom: 12px;
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.loc__subtitle + * {
  border-top: 1px solid var(--color-line-inverse);
}

/* Peške: redovi tabele u dve kolone — broj | mesto | minuti */
.walk {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 32px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.walk__item {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding-block: 12px;
  border-bottom: 1px solid var(--color-line-inverse);
  font-size: 14.5px;
  transition: color var(--duration-fast) var(--ease-out);
}

.walk__num {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

.walk__item.is-active .walk__num {
  border-color: var(--color-accent);
  background: var(--color-accent);
}

.walk__name {
  color: var(--color-text-inverse-soft);
}

.walk__item.is-active .walk__name {
  color: var(--color-text-inverse);
}

.walk__time {
  font-weight: var(--weight-medium);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

/* Kolima: 2 × 2 krupna broja odvojena tankim linijama */
.car {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
}

.car__item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px 20px 20px;
  border-bottom: 1px solid var(--color-line-inverse);
}

.car__item:nth-child(odd) {
  padding-left: 0;
}

.car__item:nth-child(even) {
  border-left: 1px solid var(--color-line-inverse);
}

.car__time {
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 1;
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.car__name {
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-muted);
}

/* Tablet i telefon: sve u jednoj koloni; mapa dobija svoj odnos stranica */
@media (max-width: 900px) {
  .loc__head,
  .loc__body {
    grid-template-columns: minmax(0, 1fr);
  }

  .loc__head {
    align-items: start;
  }

  .map {
    min-height: 0;
    aspect-ratio: 3 / 2;
  }
}

@media (max-width: 560px) {
  .map {
    aspect-ratio: 1;
  }

  .walk {
    grid-template-columns: minmax(0, 1fr);
  }

  .car__time {
    font-size: 22px;
  }

  .car__item {
    padding-inline: 14px;
  }
}
</style>

<!-- Oznake i kontrole pravi Leaflet, pa do njih scoped stilovi ne dopiru. -->
<style>
/* Tamna mapa: podloga OpenStreetMap-a u sivim tonovima, obrnuta, da se uklopi u tamnu stranicu */
#lokacija .leaflet-container {
  background: var(--color-bg-inverse);
}

#lokacija .leaflet-tile-pane {
  filter: grayscale(1) invert(1) brightness(0.88) contrast(0.9);
}

.loc-pin {
  display: grid;
  place-items: center;
  border-radius: var(--radius-full);
  background: var(--color-text-inverse);
  color: var(--color-text);
  font-family: var(--font-grotesk);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
  font-variant-numeric: tabular-nums;
  box-shadow: var(--shadow-pop);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    color var(--duration-fast) var(--ease-out),
    box-shadow var(--duration-fast) var(--ease-out);
}

/* Bez uvećanja: Leaflet postavlja oznaku preko `transform`, pa bi je `scale` pomerio sa mesta */
.loc-pin.is-active {
  z-index: 900 !important;
  background: var(--color-accent);
  color: var(--color-text-inverse);
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
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  font-size: 11px;
  font-weight: var(--weight-semibold);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  white-space: nowrap;
  box-shadow: var(--shadow-pop);
}

#lokacija .leaflet-bar {
  border: 1px solid var(--color-line-inverse);
  border-radius: var(--radius-sm);
  box-shadow: none;
}

#lokacija .leaflet-bar a {
  background: var(--color-bg-inverse);
  border-bottom-color: var(--color-line-inverse);
  color: var(--color-text-inverse);
}

#lokacija .leaflet-bar a:hover {
  background: var(--color-accent);
}

#lokacija .leaflet-control-attribution {
  background: var(--color-surface-glass-dark);
  color: var(--color-text-inverse-muted);
  font-size: var(--text-2xs);
}

#lokacija .leaflet-control-attribution a {
  color: var(--color-text-inverse-soft);
}
</style>
