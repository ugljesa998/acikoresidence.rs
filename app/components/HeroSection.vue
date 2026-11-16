<script setup lang="ts">
import { project } from '~/data/project'

const { t, localeProperties } = useI18n()

const num = (n: number, digits = 0) =>
  new Intl.NumberFormat(localeProperties.value.language, { maximumFractionDigits: digits }).format(n)

const facts = computed(() => [
  { value: String(project.units), label: t('hero.facts.units') },
  {
    value: t('hero.facts.sizeValue', { min: num(project.minArea), max: num(project.maxArea) }),
    label: t('hero.facts.size'),
  },
  { value: t('hero.facts.terraceValue', { n: num(project.maxTerrace, 1) }), label: t('hero.facts.terrace') },
])

// Blagi parallax: slika se pomera sporije od stranice.
const media = ref<HTMLElement>()
let raf = 0
function onScroll() {
  if (raf) return
  raf = requestAnimationFrame(() => {
    raf = 0
    const y = Math.min(window.scrollY, window.innerHeight)
    if (media.value) media.value.style.transform = `translate3d(0, ${y * 0.25}px, 0)`
  })
}
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div ref="media" class="hero__media">
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
      <p class="hero__eyebrow reveal" style="--d: 0.35s">
        <span class="hero__tri" aria-hidden="true" />
        {{ t('hero.eyebrow') }}
      </p>

      <h1 id="hero-title" class="hero__title">
        <span class="hero__line"><span class="reveal-up" style="--d: 0.45s">{{ t('hero.titleA') }}</span></span>
        <span class="hero__line"><em class="reveal-up" style="--d: 0.58s">{{ t('hero.titleB') }}</em></span>
      </h1>

      <p class="hero__lead reveal" style="--d: 0.85s">{{ t('hero.lead') }}</p>

      <div class="hero__actions reveal" style="--d: 1s">
        <a href="#stanovi" class="btn btn--primary">
          {{ t('cta.choose') }}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M4 12h16M14 6l6 6-6 6" />
          </svg>
        </a>
        <a href="#kontakt" class="btn btn--ghost">{{ t('cta.inquiry') }}</a>
      </div>
    </div>

    <div class="hero__foot reveal" style="--d: 1.2s">
      <div class="hero__foot-inner container">
        <dl class="facts">
          <div v-for="f in facts" :key="f.label" class="fact">
            <dt class="fact__label">{{ f.label }}</dt>
            <dd class="fact__value">{{ f.value }}</dd>
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
  background: var(--ink);
  color: #fff;
  isolation: isolate;
}

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

/* Tamni prelaz levo i dole, da tekst bude čitljiv preko neba */
.hero__scrim {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, rgb(14 12 10 / 0.55) 0%, rgb(14 12 10 / 0) 22%),
    linear-gradient(0deg, rgb(14 12 10 / 0.82) 0%, rgb(14 12 10 / 0.35) 26%, rgb(14 12 10 / 0) 48%),
    linear-gradient(90deg, rgb(14 12 10 / 0.76) 0%, rgb(14 12 10 / 0.46) 40%, rgb(14 12 10 / 0) 66%);
}

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
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.82);
}

.hero__tri {
  width: 13px;
  height: 12px;
  background: var(--red-logo);
  -webkit-mask: url('/brand/logo-mark.png') center / contain no-repeat;
  mask: url('/brand/logo-mark.png') center / contain no-repeat;
}

.hero__title {
  max-width: 14em;
  font-family: var(--font-display);
  font-size: clamp(44px, 5.6vw, 104px);
  font-weight: 500;
  line-height: 0.96;
  letter-spacing: -0.015em;
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
  font-weight: 400;
  color: var(--sand);
}

.hero__lead {
  max-width: 34em;
  margin-top: clamp(22px, 3.2vh, 34px);
  font-size: clamp(16px, 1.25vw, 18.5px);
  line-height: 1.6;
  color: rgb(255 255 255 / 0.84);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: clamp(28px, 4.5vh, 44px);
}

/* Donja traka sa činjenicama */
.hero__foot {
  border-top: 1px solid rgb(255 255 255 / 0.18);
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
  flex-direction: column-reverse;
  justify-content: flex-end;
  gap: 4px;
  padding: 22px clamp(20px, 3vw, 48px) 26px;
  border-left: 1px solid rgb(255 255 255 / 0.18);
}

.fact:first-child {
  padding-left: 0;
  border-left: 0;
}

.fact__value {
  font-family: var(--font-display);
  font-size: clamp(26px, 2.3vw, 36px);
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
}

.fact__label {
  font-size: 11.5px;
  letter-spacing: 0.08em;
  color: rgb(255 255 255 / 0.66);
}

.scrollcue {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: rgb(255 255 255 / 0.78);
}

.scrollcue__track {
  position: relative;
  width: 1px;
  height: 44px;
  overflow: hidden;
  background: rgb(255 255 255 / 0.25);
}

.scrollcue__dot {
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  height: 14px;
  background: #fff;
  animation: cue 2.2s var(--ease-out) infinite;
}

@keyframes cue {
  from {
    transform: translateY(-14px);
  }
  to {
    transform: translateY(44px);
  }
}

/* Ulazne animacije */
.reveal {
  animation: fade-up 1.1s var(--ease-out) var(--d, 0s) both;
}

.reveal-up {
  animation: line-up 1.2s var(--ease-out) var(--d, 0s) both;
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

@media (max-width: 900px) {
  .hero__media :deep(.hero__img) {
    object-position: 60% 50%;
  }

  .hero__scrim {
    background:
      linear-gradient(180deg, rgb(14 12 10 / 0.5) 0%, rgb(14 12 10 / 0) 20%),
      linear-gradient(0deg, rgb(14 12 10 / 0.9) 0%, rgb(14 12 10 / 0.62) 42%, rgb(14 12 10 / 0) 72%);
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
      rgb(14 12 10 / 0.5) 0%,
      rgb(14 12 10 / 0) 16%,
      rgb(14 12 10 / 0) 28%,
      rgb(14 12 10 / 0.75) 48%,
      rgb(20 18 15 / 1) 64%
    );
  }
}

@media (max-width: 560px) {
  .hero__eyebrow {
    font-size: 10.5px;
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
    font-size: 10.5px;
    letter-spacing: 0.02em;
  }
}
</style>
