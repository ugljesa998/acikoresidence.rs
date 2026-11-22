<script setup lang="ts">
// Gradnja (arhitektonski stil): podaci od investitora o tome kako je zgrada građena.
// Gore oznaka „Gradnja“, naslov levo i kratak opis desno (kao kontakt); ispod četiri odlike gradnje
// (grejanje, zidovi, fasada, stolarija) u četiri kolone odvojene tankim linijama, kao kartice stanova.
// Završetak gradnje je u sekciji „O projektu“ (na fotografiji).
// Tekstovi su ključevi `build.*` u i18n/locales/*.json.
const { t } = useI18n()

const specs = ['heating', 'walls', 'facade', 'windows'] as const

</script>

<template>
  <section id="gradnja" class="build" aria-labelledby="build-title">
    <div class="container">
      <div class="build__head">
        <p class="section-label build__label">{{ t('build.eyebrow') }}</p>
        <h2 id="build-title" class="section-title build__title">{{ t('build.title') }}</h2>
        <p class="build__lead">{{ t('build.lead') }}</p>
      </div>

      <!-- Odlike gradnje: broj, naslov, opis -->
      <ol class="specs">
        <li v-for="(key, i) in specs" :key="key" class="spec">
          <span class="spec__num" aria-hidden="true">0{{ i + 1 }}</span>
          <h3 class="spec__title">{{ t(`build.specs.${key}.title`) }}</h3>
          <p class="spec__text">{{ t(`build.specs.${key}.text`) }}</p>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.build {
  padding-top: clamp(80px, 9vw, 144px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Oznaka preko cele širine; ispod naslov levo i opis desno, u dve iste polovine */
.build__head {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  column-gap: clamp(32px, 4vw, 72px);
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.build__label {
  grid-column: 1 / -1;
}

.build__title,
.build__lead {
  margin-top: clamp(16px, 1.8vw, 28px);
}

/* Malo spušten da prvi red opisa stoji u ravni sa vrhom slova naslova */
.build__lead {
  padding-top: 0.5em;
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Četiri odlike u četiri iste kolone; tanka linija između njih na sredini razmaka */
.specs {
  --gap: 40px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: var(--gap);
  margin: clamp(40px, 4.4vw, 64px) 0 0;
  border-top: 1px solid var(--color-line-inverse);
  padding: 0;
  list-style: none;
  border-bottom: 1px solid var(--color-line-inverse);
}

.spec {
  position: relative;
  padding-block: clamp(24px, 2.6vw, 36px);
}

.spec + .spec::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 calc(var(--gap) / -2);
  width: 1px;
  background: var(--color-line-inverse);
}

.spec__num {
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
}

.spec__title {
  margin-top: 18px;
  font-size: clamp(20px, 1.7vw, 26px);
  font-weight: var(--weight-regular);
  font-stretch: 110%;
  line-height: 1.15;
  letter-spacing: -0.01em;
}

.spec__text {
  margin-top: 10px;
  font-size: 14.5px;
  line-height: 1.55;
  color: var(--color-text-inverse-muted);
}

/* Laptop i tablet: odlike 2 × 2 */
@media (max-width: 1080px) {
  .specs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .spec:nth-child(odd)::before {
    display: none;
  }

  .spec:nth-child(-n + 2) {
    border-bottom: 1px solid var(--color-line-inverse);
  }
}

@media (max-width: 900px) {
  .build__head {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Telefon: sve jedno ispod drugog, odvojeno linijama */
@media (max-width: 600px) {
  .specs {
    grid-template-columns: minmax(0, 1fr);
  }

  .spec + .spec::before {
    display: none;
  }

  .specs {
    border-bottom: 0;
  }

  .spec,
  .spec:nth-child(-n + 2) {
    border-bottom: 1px solid var(--color-line-inverse);
  }
}
</style>
