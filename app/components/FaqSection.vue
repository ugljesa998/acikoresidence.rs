<script setup lang="ts">
// Česta pitanja (arhitektonski stil): gore oznaka, naslov levo i opis desno (kao „Gradnja“); ispod pitanja kao
// redovi tabele odvojeni tankim linijama — broj, pitanje i „+“ koji se okrene u „×“ kad se odgovor otvori.
// Koristi <details>, pa su svi odgovori u HTML-u od starta: Google i AI asistenti ih čitaju i kad su zatvoreni,
// a stranica radi i bez JavaScript-a. Prvo pitanje je otvoreno.
// Isti odgovori idu i u strukturisane podatke (FAQPage), iz composables/useFaq.ts.
const { t } = useI18n()
const faq = useFaq()
const { faqPage } = useSchemaOrg()

useJsonLd('faq', () => [faqPage(faq.value)])
</script>

<template>
  <section id="pitanja" class="faq" aria-labelledby="faq-title">
    <div class="container">
      <div class="faq__head">
        <p class="section-label faq__label">{{ t('faq.eyebrow') }}</p>
        <h2 id="faq-title" class="section-title faq__title">{{ t('faq.title') }}</h2>
        <p class="faq__lead">{{ t('faq.lead') }}</p>
      </div>

      <div class="faq__list">
        <details v-for="(item, i) in faq" :key="item.key" class="qa" :open="i === 0">
          <summary class="qa__q">
            <span class="qa__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3 class="qa__title">{{ item.q }}</h3>
            <span class="qa__icon" aria-hidden="true" />
          </summary>
          <p class="qa__a">{{ item.a }}</p>
        </details>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq {
  padding-top: clamp(80px, 9vw, 144px);
  background: var(--color-bg-inverse);
  color: var(--color-text-inverse);
  font-family: var(--font-grotesk);
  scroll-margin-top: var(--header-h-compact);
}

/* Oznaka preko cele širine; ispod naslov levo i opis desno, u dve iste polovine (kao „Gradnja“) */
.faq__head {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  column-gap: clamp(32px, 4vw, 72px);
  padding-top: 20px;
  border-top: 1px solid var(--color-line-inverse);
}

.faq__label {
  grid-column: 1 / -1;
}

.faq__title,
.faq__lead {
  margin-top: clamp(16px, 1.8vw, 28px);
}

.faq__lead {
  padding-top: 0.5em;
  max-width: 34em;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

/* Pitanja: redovi preko cele širine, odvojeni tankim linijama */
.faq__list {
  margin-top: clamp(40px, 4.4vw, 64px);
  border-top: 1px solid var(--color-line-inverse);
}

.qa {
  border-bottom: 1px solid var(--color-line-inverse);
}

/* Broj | pitanje | „+“; pitanje počinje u ravni sa desnom polovinom zaglavlja na širokom ekranu */
.qa__q {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 16px;
  padding-block: clamp(18px, 2vw, 26px);
  cursor: pointer;
  list-style: none;
}

.qa__q::-webkit-details-marker {
  display: none;
}

.qa__q:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}

.qa__num {
  font-size: 12px;
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-label);
  font-variant-numeric: tabular-nums;
  color: var(--color-accent);
}

.qa__title {
  font-size: clamp(18px, 1.6vw, 24px);
  font-weight: var(--weight-regular);
  font-stretch: 110%;
  line-height: 1.25;
  letter-spacing: -0.01em;
  transition: color var(--duration-fast) var(--ease-out);
}

.qa__q:hover .qa__title {
  color: var(--color-accent);
}

/* „+“ od dve tanke linije; otvoreno pitanje ga okrene u „×“ */
.qa__icon {
  position: relative;
  width: 28px;
  height: 28px;
  border: 1px solid var(--color-line-inverse-strong);
  border-radius: var(--radius-sm);
  transition:
    background-color var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out);
}

/* Kvadrat stoji, okreće se samo krstić u njemu */
.qa__icon::before,
.qa__icon::after {
  content: '';
  position: absolute;
  inset: 50% auto auto 50%;
  width: 12px;
  height: 1px;
  background: currentColor;
  transform: translate(-50%, -50%);
  transition: transform var(--duration-fast) var(--ease-out);
}

.qa__icon::after {
  transform: translate(-50%, -50%) rotate(90deg);
}

.qa[open] .qa__icon {
  background: var(--color-accent);
  border-color: var(--color-accent);
}

.qa[open] .qa__icon::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.qa[open] .qa__icon::after {
  transform: translate(-50%, -50%) rotate(135deg);
}

/* Odgovor ispod pitanja, uvučen do teksta pitanja */
.qa__a {
  max-width: 46em;
  margin: 0;
  padding: 0 44px clamp(20px, 2.2vw, 30px) 64px;
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--color-text-inverse-soft);
}

@media (max-width: 900px) {
  .faq__head {
    grid-template-columns: minmax(0, 1fr);
  }
}

/* Telefon: uži broj, odgovor bez uvlačenja */
@media (max-width: 600px) {
  .qa__q {
    grid-template-columns: 28px minmax(0, 1fr) 28px;
    gap: 12px;
  }

  .qa__a {
    padding-inline: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .qa__icon,
  .qa__icon::before,
  .qa__icon::after {
    transition: none;
  }
}
</style>
