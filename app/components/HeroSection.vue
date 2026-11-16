<script setup lang="ts">
import { project } from '~/data/project'

// Hero: fotografija zgrade preko celog ekrana, naslov, dva dugmeta i traka sa činjenicama iz kataloga.
const { t, localeProperties } = useI18n()

const formatNumber = (n: number, digits = 0) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: digits }).format(n)

const facts = computed(() => [
  { value: String(project.units), label: t('hero.facts.units') },
  {
    value: t('hero.facts.sizeValue', {
      min: formatNumber(project.minArea),
      max: formatNumber(project.maxArea),
    }),
    label: t('hero.facts.size'),
  },
  {
    value: t('hero.facts.terraceValue', { n: formatNumber(project.maxTerrace, 1) }),
    label: t('hero.facts.terrace'),
  },
])

// Blagi parallax: slika se pomera sporije od stranice (isključen ako korisnik ne želi animacije).
const PARALLAX_SPEED = 0.25
const { y } = useWindowScroll()
const { height } = useWindowSize()
const motion = usePreferredReducedMotion()
const parallaxStyle = computed(() =>
  motion.value === 'reduce'
    ? undefined
    : { transform: `translate3d(0, ${Math.min(y.value, height.value) * PARALLAX_SPEED}px, 0)` },
)
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="hero__media" :style="parallaxStyle">
      <NuxtPicture
        src="/images/hero.jpg"
        :alt="t('hero.imageAlt')"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw 2xl:100vw"
        :preload="{ fetchPriority: 'high' }"
        :img-attrs="{ class: 'hero__img' }"
      />
    </div>
    <div class="hero__scrim" aria-hidden="true" />

    <div class="hero__body container">
      <p class="hero__eyebrow reveal" style="--delay: 0.35s">
        <span class="hero__mark" aria-hidden="true" />
        {{ t('hero.eyebrow') }}
      </p>

      <h1 id="hero-title" class="hero__title">
        <span class="hero__line"><span class="reveal-line" style="--delay: 0.45s">{{ t('hero.titleA') }}</span></span>
        <span class="hero__line"><em class="reveal-line" style="--delay: 0.58s">{{ t('hero.titleB') }}</em></span>
      </h1>

      <p class="hero__lead reveal" style="--delay: 0.85s">{{ t('hero.lead') }}</p>

      <div class="hero__actions reveal" style="--delay: 1s">
        <a href="#stanovi" class="btn btn--primary">
          {{ t('cta.choose') }}
          <UiIcon name="arrow" />
        </a>
        <a href="#kontakt" class="btn btn--ghost">{{ t('cta.prices') }}</a>
      </div>
    </div>

    <div class="hero__foot reveal" style="--delay: 1.2s">
      <div class="hero__foot-inner container">
        <dl class="facts">
          <div v-for="fact in facts" :key="fact.label" class="fact">
            <dt class="fact__label">{{ fact.label }}</dt>
            <dd class="fact__value">{{ fact.value }}</dd>
          </div>
        </dl>
        <a href="#stanovi" class="scrollcue">
          <span>{{ t('hero.scroll') }}</span>
          <span class="scrollcue__track" aria-hidden="true"><span class="scrollcue__dot" /></span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  isolation: isolate;
}

/* Fotografija */
.hero__media {
  position: absolute;
  inset: 0;
  z-index: -2;
  will-change: transform;
}

.hero__media :deep(picture),
.hero__media :deep(.hero__img) {
  width: 100%;
  height: 100%;
}

.hero__media :deep(.hero__img) {
  object-fit: cover;
  object-position: 42% 50%;
  animation: hero-zoom 2.8s var(--ease-out) both;
}

@keyframes hero-zoom {
  from {
    transform: scale(1.14);
    filter: brightness(0.7);
  }
  to {
    transform: scale(1);
    filter: none;
  }
}

/* Zatamnjenje gore (header), dole (činjenice) i levo (tekst preko neba) */
.hero__scrim {
  --o: var(--color-overlay);
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--o) 55%, transparent) 0%, transparent 22%),
    linear-gradient(
      0deg,
      color-mix(in srgb, var(--o) 82%, transparent) 0%,
      color-mix(in srgb, var(--o) 35%, transparent) 26%,
      transparent 48%
    ),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--o) 76%, transparent) 0%,
      color-mix(in srgb, var(--o) 46%, transparent) 40%,
      transparent 66%
    );
}

/* Tekst */
.hero__body {
  padding-top: calc(var(--header-h) + 48px);
  padding-bottom: clamp(40px, 7vh, 72px);
}

.hero__eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: clamp(20px, 3vh, 32px);
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.hero__mark {
  width: 13px;
  height: 12px;
  background: var(--color-brand);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.hero__title {
  max-width: 14em;
  font-family: var(--font-display);
  font-size: var(--text-display);
  font-weight: var(--weight-medium);
  line-height: 0.96;
  letter-spacing: var(--tracking-display);
  text-wrap: balance;
}

/* Maska za animaciju reda; padding ostavlja mesta za kvačice (Ž, Й) i repove slova (g, j, у). */
.hero__line {
  display: block;
  overflow: hidden;
  padding-block: 0.14em 0.26em;
  margin-block: -0.14em -0.26em;
}

.hero__line > * {
  display: block;
}

.hero__title em {
  font-style: italic;
  font-weight: var(--weight-regular);
  color: var(--color-highlight);
}

.hero__lead {
  max-width: 34em;
  margin-top: clamp(22px, 3.2vh, 34px);
  font-size: var(--text-lead);
  line-height: 1.6;
  color: var(--color-text-inverse-soft);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(28px, 4.5vh, 44px);
}

/* Traka sa činjenicama */
.hero__foot {
  border-top: 1px solid var(--color-line-inverse);
}

.hero__foot-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.facts {
  display: flex;
}

.fact {
  display: flex;
  flex-direction: column-reverse; /* vrednost iznad oznake, a u HTML-u ostaje dt → dd */
  justify-content: flex-end;
  gap: 4px;
  padding: 22px clamp(20px, 3vw, 48px) 26px;
  border-left: 1px solid var(--color-line-inverse);
}

.fact:first-child {
  padding-left: 0;
  border-left: 0;
}

.fact__value {
  font-family: var(--font-display);
  font-size: var(--text-stat);
  font-weight: var(--weight-medium);
  line-height: 1;
  white-space: nowrap;
}

.fact__label {
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  color: var(--color-text-inverse-muted);
}

.scrollcue {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-caps);
  text-transform: uppercase;
  color: var(--color-text-inverse-soft);
}

.scrollcue__track {
  position: relative;
  width: 1px;
  height: 44px;
  overflow: hidden;
  background: var(--color-line-inverse);
}

.scrollcue__dot {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 14px;
  background: var(--color-text-inverse);
  animation: scrollcue 2.2s var(--ease-out) infinite;
}

@keyframes scrollcue {
  from {
    transform: translateY(-14px);
  }
  to {
    transform: translateY(44px);
  }
}

/* Ulazne animacije; `--delay` se zadaje u template-u */
.reveal {
  animation: fade-up 1.1s var(--ease-out) var(--delay, 0s) both;
}

.reveal-line {
  animation: line-up 1.2s var(--ease-out) var(--delay, 0s) both;
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes line-up {
  from {
    transform: translateY(105%);
  }
  to {
    transform: none;
  }
}

/* Tablet */
@media (max-width: 900px) {
  .hero__media :deep(.hero__img) {
    object-position: 60% 50%;
  }

  .hero__scrim {
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--o) 50%, transparent) 0%, transparent 20%),
      linear-gradient(
        0deg,
        color-mix(in srgb, var(--o) 90%, transparent) 0%,
        color-mix(in srgb, var(--o) 62%, transparent) 42%,
        transparent 72%
      );
  }

  .scrollcue {
    display: none;
  }

  .facts {
    width: 100%;
  }

  .fact {
    flex: 1;
    padding: 18px 14px 22px;
  }
}

/* Telefon: slika gore, tekst na tamnoj podlozi ispod nje */
@media (max-width: 700px) {
  .hero__media {
    bottom: auto;
    height: 64svh;
  }

  .hero__media :deep(.hero__img) {
    object-position: 66% 40%;
  }

  .hero__scrim {
    background: linear-gradient(
      180deg,
      color-mix(in srgb, var(--o) 50%, transparent) 0%,
      transparent 16%,
      transparent 28%,
      color-mix(in srgb, var(--o) 75%, transparent) 48%,
      var(--o) 64%
    );
  }
}

@media (max-width: 560px) {
  .hero__eyebrow {
    font-size: var(--text-2xs);
    letter-spacing: 0.2em;
  }

  .hero__actions .btn {
    flex: 1 1 100%;
  }

  .fact {
    padding-inline: 10px;
  }

  .fact__value {
    font-size: 21px;
  }

  .fact__label {
    font-size: var(--text-2xs);
    letter-spacing: 0.02em;
  }
}
</style>
