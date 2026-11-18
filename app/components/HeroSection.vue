<script setup lang="ts">
import { floors } from '~/data/apartments'
import { project } from '~/data/project'

// Hero (arhitektonski stil): fotografija zgrade od samog vrha preko celog ekrana; header je providan preko nje.
// Pri dnu, preko zatamnjenog dela slike: nadnaslov, naslov, pa iznad tanke linije četiri krupna broja
// iz kataloga (data/project.ts i data/apartments.ts) i dugme „Izaberite stan“.
const { t, localeProperties } = useI18n()

const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: digits }).format(n)

const stats = computed(() => [
  { value: String(project.units), label: t('hero.stats.units') },
  { value: `${formatNumber(project.minArea)}–${formatNumber(project.maxArea)}`, label: t('hero.stats.area') },
  { value: String(floors.length), label: t('hero.stats.floors', { n: project.unitsPerFloor }) },
  { value: formatNumber(project.maxTerrace, 1), label: t('hero.stats.terrace') },
])
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__media">
      <NuxtPicture
        src="/images/hero.jpg"
        :alt="t('hero.imageAlt')"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw 2xl:100vw"
        :preload="{ fetchPriority: 'high' }"
        :img-attrs="{ class: 'hero__img' }"
      />
    </div>

    <div class="hero__body container">
      <p class="hero__eyebrow reveal" style="--delay: 0.2s">{{ t('hero.eyebrow') }}</p>

      <h1 id="hero-title" class="hero__title">
        <span class="hero__line"><span style="--delay: 0.3s">{{ t('hero.titleA') }}</span></span>
        <span class="hero__line"><span style="--delay: 0.42s">{{ t('hero.titleB') }}</span></span>
      </h1>

      <div class="hero__bar reveal" style="--delay: 0.7s">
        <dl class="stats">
          <div v-for="stat in stats" :key="stat.label" class="stat">
            <dt class="stat__label">{{ stat.label }}</dt>
            <dd class="stat__value">{{ stat.value }}</dd>
          </div>
        </dl>

        <a href="#spratovi" class="btn btn--primary hero__cta">
          {{ t('cta.choose') }}
          <UiIcon name="arrow" />
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Fotografija preko celog prvog ekrana; tekst i brojevi su pri dnu */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100vh;
  height: 100svh;
  min-height: 640px;
  overflow: hidden;
  isolation: isolate;
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
}

.hero__media {
  position: absolute;
  inset: 0;
  z-index: -2;
}

.hero__media :deep(picture),
.hero__media :deep(.hero__img) {
  width: 100%;
  height: 100%;
}

.hero__media :deep(.hero__img) {
  object-fit: cover;
  object-position: 58% 50%;
  animation: settle 2.6s var(--ease-out) both;
}

@keyframes settle {
  from {
    transform: scale(1.08);
  }
}

/* Zatamnjenje: gore za header, dole i levo za tekst i brojeve; zgrada desno ostaje svetla */
.hero::after {
  --o: var(--color-overlay);
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--o) 60%, transparent) 0%, transparent 16%),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--o) 90%, transparent) 0%,
      color-mix(in srgb, var(--o) 60%, transparent) 34%,
      transparent 62%
    ),
    linear-gradient(90deg, color-mix(in srgb, var(--o) 45%, transparent) 0%, transparent 55%);
}

.hero__body {
  padding-bottom: clamp(20px, 3.5vh, 40px);
}

.hero__eyebrow {
  margin-bottom: clamp(14px, 2.2vh, 24px);
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

/* Naslov: širok, tanak; drugi red prigušen. Redovi „izranjaju“ odozdo. */
.hero__title {
  font-size: var(--text-hero);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 0.98;
  letter-spacing: -0.035em;
}

/* Maska za animaciju reda; padding ostavlja mesta za kvačice (Š, Ć) i repove slova (j, g). */
.hero__line {
  display: block;
  overflow: hidden;
  padding-block: 0.14em 0.1em;
  margin-block: -0.14em -0.1em;
}

.hero__line > span {
  display: block;
  text-wrap: balance;
  animation: line-up 1.3s var(--ease-out) var(--delay, 0s) both;
}

.hero__line:nth-child(2) > span {
  color: var(--color-text-inverse-muted);
}

/* Traka ispod naslova: četiri broja odvojena tankim linijama, dugme desno */
.hero__bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 32px;
  margin-top: clamp(24px, 3.5vh, 40px);
  border-top: 1px solid var(--color-line-on-photo);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat {
  display: flex;
  flex-direction: column-reverse; /* broj iznad oznake, a u HTML-u ostaje dt → dd */
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 20px 2px;
  border-left: 1px solid var(--color-line-on-photo);
}

.stat:first-child {
  padding-left: 0;
  border-left: 0;
}

.stat__value {
  font-size: var(--text-figure);
  font-weight: 300;
  font-stretch: var(--stretch-wide);
  line-height: 0.95;
  letter-spacing: -0.03em;
  white-space: nowrap;
}

.stat__label {
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.hero__cta {
  --btn-h: 48px;
  font-size: 12px;
}

/* Ulazne animacije; `--delay` se zadaje u template-u */
.reveal {
  animation: fade-up 1.2s var(--ease-out) var(--delay, 0s) both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes line-up {
  from {
    transform: translateY(105%);
  }
}

/* Tablet: dugme ispod brojeva */
@media (max-width: 980px) {
  .hero__bar {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }

  .hero__cta {
    justify-self: start;
  }
}

/* Telefon: slika isečena tako da se vidi zgrada; brojevi 2 × 2, dugme preko cele širine */
@media (max-width: 560px) {
  .hero__media :deep(.hero__img) {
    object-position: 74% 50%;
  }

  .hero__eyebrow {
    font-size: 11px;
  }

  .stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stat {
    padding: 16px 14px 14px;
  }

  .stat:nth-child(3) {
    padding-left: 0;
    border-left: 0;
  }

  .stat:nth-child(-n + 2) {
    border-bottom: 1px solid var(--color-line-on-photo);
  }

  .hero__cta {
    justify-self: stretch;
  }
}
</style>
