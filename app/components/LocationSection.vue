<script setup lang="ts">
import { building, byCar, nearby } from '~/data/location'

// Lokacija: koliko je šta daleko (peške i kolima) i mapa. Podaci su u data/location.ts.
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

const walkList = computed(() =>
  nearby.map((place) => ({
    key: place.key,
    name: t(`location.places.${place.key}`),
    time: formatTime(Math.round(place.walkMeters / WALK_METERS_PER_MINUTE)),
  })),
)
const carList = computed(() =>
  byCar.map((route) => ({
    key: route.key,
    name: t(`location.car.${route.key}`),
    time: formatTime(route.minutes, route.approx),
  })),
)
const motorwayTime = computed(() => formatTime(byCar.find((r) => r.key === 'motorway')?.minutes ?? 0))

const mapSrc = `https://www.google.com/maps?q=${building.lat},${building.lon}&z=15&output=embed`
</script>

<template>
  <section id="lokacija" class="section" aria-labelledby="location-title">
    <div class="container">
      <header class="section-head">
        <h2 id="location-title" class="h2">{{ t('location.title') }}</h2>
        <p class="lead">{{ t('location.lead', { n: building.centerWalkMinutes, m: motorwayTime }) }}</p>
      </header>

      <div class="location">
        <div class="location__lists">
          <div>
            <h3 class="list-title">{{ t('location.walkTitle') }}</h3>
            <ul class="distances">
              <li v-for="item in walkList" :key="item.key">
                <span>{{ item.name }}</span>
                <span class="num">{{ item.time }}</span>
              </li>
            </ul>
            <p class="location__note">{{ t('location.note') }}</p>
          </div>

          <div>
            <h3 class="list-title">{{ t('location.carTitle') }}</h3>
            <ul class="distances">
              <li v-for="item in carList" :key="item.key">
                <span>{{ item.name }}</span>
                <span class="num">{{ item.time }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="location__map">
          <iframe
            :src="mapSrc"
            :title="t('location.mapTitle')"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          />
          <a :href="building.mapsUrl" class="location__link" target="_blank" rel="noopener">
            <UiIcon name="pin" />{{ t('contact.map') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.location {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  align-items: start;
  gap: clamp(32px, 6vw, 96px);
}

.location__lists {
  display: grid;
  gap: 40px;
}

.list-title {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-line-strong);
  font-size: var(--text-h3);
  font-weight: var(--weight-medium);
  letter-spacing: -0.02em;
}

.distances li {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 13px;
  border-bottom: 1px solid var(--color-line);
}

.distances .num {
  font-weight: var(--weight-medium);
}

.location__note {
  margin-top: 12px;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.location__map iframe {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3.4;
  border: 0;
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.location__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-weight: var(--weight-medium);
  text-decoration: underline;
  text-decoration-color: var(--color-line-strong);
  text-underline-offset: 5px;
}

.location__link:hover {
  text-decoration-color: currentColor;
}

@media (max-width: 900px) {
  .location {
    grid-template-columns: 1fr;
  }

  .location__map {
    order: -1;
  }

  .location__map iframe {
    aspect-ratio: 4 / 3;
  }
}
</style>
